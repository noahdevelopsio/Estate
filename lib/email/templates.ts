export const emailTemplates = {
    welcomeEmail: (name: string, tempPassword?: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Welcome to Estate Management</h1>
            <p>Hi ${name},</p>
            <p>Your account has been created successfully.</p>
            ${tempPassword ? `
                <p>Your temporary password is: <strong>${tempPassword}</strong></p>
                <p>Please log in and change it immediately.</p>
            ` : ''}
            <p>You can access your tenant portal here: <a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a></p>
        </div>
    `,

    paymentReceipt: (amount: number, date: Date, method: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Payment Receipt</h1>
            <p>We received your payment.</p>
            <ul>
                <li><strong>Amount:</strong> $${amount}</li>
                <li><strong>Date:</strong> ${date.toLocaleDateString()}</li>
                <li><strong>Method:</strong> ${method}</li>
            </ul>
            <p>Thank you!</p>
        </div>
    `,

    maintenanceUpdate: (title: string, status: string, description?: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Maintenance Update</h1>
            <p>The status of your request <strong>"${title}"</strong> has been updated.</p>
            <p><strong>New Status:</strong> ${status}</p>
            ${description ? `<p><strong>Note:</strong> ${description}</p>` : ''}
            <p>Log in to view details.</p>
        </div>
    `
}
