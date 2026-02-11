import { Resend } from "resend"
import { EmailProvider } from "../types"

export class ResendEmailProvider implements EmailProvider {
    private client: Resend;
    private from: string;

    constructor(apiKey: string, from: string = "Acme <onboarding@resend.dev>") {
        this.client = new Resend(apiKey);
        this.from = from;
    }

    async send(to: string | string[], subject: string, html: string): Promise<boolean> {
        try {
            const { error } = await this.client.emails.send({
                from: this.from,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
            });

            if (error) {
                console.error("Resend Error:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Resend Exception:", error);
            return false;
        }
    }
}
