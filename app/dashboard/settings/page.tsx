import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/settings/profile-form"
import { OrgForm } from "@/components/settings/org-form"

export const metadata: Metadata = {
    title: "Settings | Estate Management",
    description: "Manage your account and organization settings.",
}

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/login")
    }

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            }
        }
    })

    if (!user) {
        redirect("/login")
    }

    const isOrgAdmin = user.role === "SUPER_ADMIN" || user.role === "PROPERTY_MANAGER"

    return (
        <div className="space-y-6 max-w-7xl">
            <div>
                <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your account and organization settings</p>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                <div className="p-6 md:p-8">
                    <Tabs defaultValue="profile" className="space-y-8">
                        <div className="border-b border-border pb-4">
                            <TabsList className="bg-muted/50 p-1">
                                <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Profile</TabsTrigger>
                                {isOrgAdmin && <TabsTrigger value="organization" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Organization</TabsTrigger>}
                                <TabsTrigger value="notifications" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Notifications</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="profile" className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-display font-bold text-foreground">Profile</h3>
                                <p className="text-sm text-muted-foreground">
                                    This is how others will see you on the site.
                                </p>
                            </div>
                            <Separator className="bg-border" />
                            <ProfileForm user={{
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                            }} />
                        </TabsContent>

                        {isOrgAdmin && (
                            <TabsContent value="organization" className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-lg font-display font-bold text-foreground">Organization</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your organization details.
                                    </p>
                                </div>
                                <Separator className="bg-border" />
                                <OrgForm organization={user.organization} />
                            </TabsContent>
                        )}

                        <TabsContent value="notifications" className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-display font-bold text-foreground">Notifications</h3>
                                <p className="text-sm text-muted-foreground">
                                    Configure how you receive notifications.
                                </p>
                            </div>
                            <Separator className="bg-border" />
                            <div className="text-sm text-muted-foreground p-6 border border-dashed border-border rounded-xl bg-muted/20 text-center">
                                Notification preferences coming soon.
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
