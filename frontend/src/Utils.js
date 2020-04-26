import { parsePhoneNumberFromString } from 'libphonenumber-js'


export const validatePhoneNumber = (rule, value, callback) => {
    const phoneNumber = parsePhoneNumberFromString(value, 'US')
    if (value.length === 0) {
        callback();
    } else if (phoneNumber.isValid()) {
        callback();
    } else {
        callback('Please enter a valid 9 digit phone number');
    }
}