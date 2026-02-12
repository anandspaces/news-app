import nodemailer from 'nodemailer';
import logger from './logger.js';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Email sent to: ${options.email}`);
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
        throw error; // Optional: rethrow if you want the caller to handle it
    }
};

export default sendEmail;
