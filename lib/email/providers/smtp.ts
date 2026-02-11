import nodemailer from "nodemailer"
import { EmailProvider } from "../types"

export class SMTPEmailProvider implements EmailProvider {
    private transporter: nodemailer.Transporter;
    private from: string;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        this.from = process.env.EMAIL_FROM || "Estate Management <noreply@example.com>";
    }

    async send(to: string | string[], subject: string, html: string): Promise<boolean> {
        try {
            const info = await this.transporter.sendMail({
                from: this.from,
                to: Array.isArray(to) ? to.join(", ") : to,
                subject,
                html,
            });

            console.log("SMTP Email sent:", info.messageId);
            return true;
        } catch (error) {
            console.error("SMTP Error:", error);
            return false;
        }
    }
}
