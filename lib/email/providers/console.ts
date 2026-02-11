import { EmailProvider } from "../types"

export class ConsoleEmailProvider implements EmailProvider {
    async send(to: string | string[], subject: string, html: string): Promise<boolean> {
        console.log("--- EMAIL SENT (CONSOLE) ---")
        console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`)
        console.log(`Subject: ${subject}`)
        console.log("--- Body ---")
        console.log(html)
        console.log("----------------------------")
        return true
    }
}
