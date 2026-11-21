import environment from './environments.js';
import twilio from 'twilio';

const notification = {};

// callback(err): err is false on success, a message otherwise
notification.sendTwilioSms = async (phone, msg, callback)=>{
    const toPhone = typeof(phone) === 'string' && phone.trim().length > 0 ? phone.trim() : false;
    const body = typeof(msg) === 'string' && msg.trim().length > 0 ? msg.trim() : false;
    if(!toPhone || !body){
        return callback('Invalid phone number or message');
    }
    const { accountSid, authToken, fromPhone } = environment.twilio;
    if(!accountSid || !authToken || !fromPhone){
        return callback('Twilio is not configured');
    }
    try{
        const client = twilio(accountSid, authToken);
        await client.messages.create({ body, from: fromPhone, to: toPhone });
        callback(false);
    }catch(err){
        callback(err.message);
    }
}

export default notification;