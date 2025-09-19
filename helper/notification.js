import environment from './environments.js';
import twilio from 'twilio';

const notification = {};

notification.sendTwilioSms = async (phone, msg, callback)=>{
    const toPhone = typeof(phone) === 'string' && phone.trim().length > 0 ? phone.trim() : false;
    const message = typeof(msg) === 'string' && msg.trim().length > 0 ? msg.trim() : false;
    if(toPhone && message){
        const client = twilio(environment.twilio.accountSid, environment.twilio.authToken);
        const message = await client.messages.create({
            body: "Hi there",
            from: environment.twilio.fromPhone,
            to: toPhone,
        });
        console.log(message);
        callback(true);
    }else{
        callback(false);
    }
}

export default notification;