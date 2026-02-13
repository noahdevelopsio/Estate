import { Metadata } from "next"
import { AuditLogList } from "@/components/audit-logs/audit-log-list"
import { getAuditLogs } from "@/lib/actions/audit-log"

export const metadata: Metadata = {
    title: "Audit Logs | Estate Management",
    description: "View system activity and security logs",
}

export default async function AuditLogsPage() {
    const logs = await getAuditLogs(100)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
                    <p className="text-muted-foreground">
                        Monitor system activity and changes across your organization.
                    </p>
                </div>
            </div>
            <AuditLogList logs={logs} />
        </div>
    )
}
