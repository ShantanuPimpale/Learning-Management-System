import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
require("dotenv").config();

interface EmailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
    try {
        const transporter: Transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure:true,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const { email, subject, template, data } = options;

        // Correct file path for the email template
        const templatePath = path.join(__dirname, '../mails', template);

        // Render the email template with EJS
        const html: string = await ejs.renderFile(templatePath, data);

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);

        console.log(`Email sent to ${email} with subject "${subject}"`);
    } catch (error: any) {
        console.error(`Error sending email to ${options.email}:`, error);
        throw new Error(`Error sending email: ${error.message}`);
    }
};

export default sendMail;
