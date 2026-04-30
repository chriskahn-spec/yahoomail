import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendOTP = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `Your YahooMail login code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log(`✅ OTP sent to ${phone}`);
  } catch (error) {
    console.error('❌ Failed to send OTP:', error);
    throw new Error('Failed to send OTP');
  }
};