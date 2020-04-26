import { parsePhoneNumber } from 'libphonenumber-js'


export const validatePhoneNumber = (rule, value, callback) => {
    let phoneNumber = parsePhoneNumber(value, 'US')

    if (phoneNumber.isValid()) {
        callback();
    } else {
        callback('Please enter a valid 9 digit phone number');
    }
}