import { EmailProvider } from "./types"
import { ConsoleEmailProvider } from "./providers/console"
import { ResendEmailProvider } from "./providers/resend"
import { SMTPEmailProvider } from "./providers/smtp"

const getEmailProvider = (): EmailProvider => {
    const providerType = process.env.EMAIL_PROVIDER || "console"

    switch (providerType) {
        case "resend":
            if (!process.env.RESEND_API_KEY) {
                console.warn("RESEND_API_KEY is missing. Falling back to Console provider.")
                return new ConsoleEmailProvider()
            }
            return new ResendEmailProvider(process.env.RESEND_API_KEY, process.env.EMAIL_FROM)
        case "smtp":
            if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
                console.warn("SMTP credentials missing. Falling back to Console provider.")
                return new ConsoleEmailProvider()
            }
            return new SMTPEmailProvider()
        case "custom":
            // return new CustomEmailProvider()
            console.warn("Custom provider not implemented. Falling back to Console provider.")
            return new ConsoleEmailProvider()
        case "console":
        default:
            return new ConsoleEmailProvider()
    }
}

export const emailService = getEmailProvider()
