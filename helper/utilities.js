// dependencies
import crypto from 'crypto';
import environment from '../helper/environments.js';

// module scaffolding
const utilites = {};

// parse json string to object
utilites.parseJSON = (jsonString) => {
    let output = {};
    try {
        output = JSON.parse(jsonString);
    } catch (e) {
        output = {};
    }
    return output;
}

// hash any string
utilites.hash = (str) => {
    if (typeof(str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environment.hashKey).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

// generate random string
utilites.createRandomString = (strLength) => {
    strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let output = '';
        for (let i = 1; i <= strLength; i++) {
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacter;
        }
        return output;
    } else {
        return false;
    }
}

// export the module
export default utilites;