export interface EmailProvider {
    send(to: string | string[], subject: string, html: string): Promise<boolean>;
}
