import data from './data.js';
import notification from '../helper/notification.js';
import url from 'url';
import http from 'http';
import https from 'https';

const worker = {};

worker.loop = ()=>{
    setInterval(worker.gatherAllChecks, 1000 * 60);
}

worker.gatherAllChecks = ()=>{
    data.list('checks', (err1, checks)=>{
        if(!err1 && checks && checks.length > 0){
            checks.forEach((check)=>{
                data.read('checks', check, (err2, checkData)=>{
                    if(!err2 && checkData){
                        worker.validateCheckData(checkData);
                    }else{
                        console.log(err2, "No check data found");
                    }
                });
            });
        }else{
            console.log(err1, "No checks found");
        }
    })
}

worker.validateCheckData = (checkData)=>{
    if(checkData && checkData.id && checkData.phone && checkData.protocol && checkData.url && checkData.method && checkData.successCodes && checkData.timeoutSeconds){
        checkData.state = typeof(checkData.state) === 'string' && ['up', 'down'].indexOf(checkData.state) > -1 ? checkData.state : 'down';
        checkData.lastChecked = typeof(checkData.lastChecked) === 'number' && checkData.lastChecked > 0 ? checkData.lastChecked : false;

        worker.performCheck(checkData);
    }else{
        console.log("Check data is not valid");
    }
}

worker.performCheck = (checkData)=>{
    let checkOutcome = {error: false, responseCode: false};
    let outcomeSent = false;

    const parsedUrl = url.parse(checkData.protocol + "://" + checkData.url, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    const requestDetails = {
        protocol: checkData.protocol + ":",
        hostname: hostName,
        method: checkData.method.toUpperCase(),
        path,
        timeout: checkData.timeoutSeconds * 1000
    };

    const protocol = checkData.protocol === 'http' ? http : https;

    const req = protocol.request(requestDetails, (res)=>{
        const status = res.statusCode;

        checkOutcome.responseCode = status;
        if(!outcomeSent){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('error', (e)=>{
        checkOutcome = {
            error: true,
            value: e
        }
        if(!outcomeSent){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('timeout', ()=>{
        checkOutcome = {
            error: true,
            value: "timeout"
        }
        if(!outcomeSent){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });
}

worker.processCheckOutcome = (checkData, checkOutcome)=>{
    const state = !checkOutcome.error && checkData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    const shouldSendAlert = checkData.lastChecked && checkData.state !== state ? true : false;

    const newCheckData = checkData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    data.update('checks', checkData.id, newCheckData, (err1)=>{
        if(!err1){
            if(shouldSendAlert){
                worker.alertUserToStatusChange(newCheckData);
            }else{
                console.log("Check outcome has not changed, no alert needed");
            }
        }else{
            console.log("Error trying to save updates to one of the checks");
        }
    });
}

worker.alertUserToStatusChange = (checkData)=>{
    const msg = "Alert: your check for " + checkData.method.toUpperCase() + " " + checkData.protocol + "://" + checkData.url + " is currently " + checkData.state;
    notification.sendTwilioSms(checkData.phone, msg, (err)=>{
        if(!err){
            console.log("User was alerted to a status change:", msg);
        }else{
            console.log("Could not send SMS alert:", err);
        }
    });
}

worker.createWorker = ()=>{
    worker.gatherAllChecks();
    worker.loop();
}

export default worker;