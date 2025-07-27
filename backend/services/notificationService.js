const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// Only initialize the client if credentials are provided
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Sends an SMS message.
 * @param {string} to The recipient's phone number in E.164 format (e.g., +919876543210).
 * @param {string} body The text of the message.
 */
const sendSms = async (to, body) => {
    if (!client) {
        console.log("Twilio credentials not configured. Skipping SMS.");
        return;
    }
    // You may need to add logic here to ensure the 'to' number is correctly formatted.
    try {
        await client.messages.create({
            body: body,
            from: twilioNumber,
            to: to 
        });
        console.log(`SMS sent successfully to ${to}`);
    } catch (error) {
        console.error(`Failed to send SMS to ${to}. Error: ${error.message}`);
    }
};

module.exports = { sendSms };