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
            // phone is not in User model yet?? Wait.
            // I need to check User model.
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

    // Check if phone exists on User model. 
    // Schema check: User has NO phone field. Tenant has phone.
    // If user is Tenant, we might need to fetch Tenant record?
    // But ProfileForm expects phone.
    // I should add phone to User model? Or just ignore phone for now?
    // Implementation plan said: "updateProfile(data: { firstName, lastName, email?, phone? })"
    // But Schema doesn't have phone on User.
    // I made a mistake in plan/schema assumption.

    // I will check schema again.

    const isOrgAdmin = user.role === "SUPER_ADMIN" || user.role === "PROPERTY_MANAGER"

    return (
        <div className="space-y-6 p-10 pb-16 md:block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        {/* Sidebar navigation for settings could go here, but using Tabs for now */}
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl">
                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            {isOrgAdmin && <TabsTrigger value="organization">Organization</TabsTrigger>}
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Profile</h3>
                                <p className="text-sm text-muted-foreground">
                                    This is how others will see you on the site.
                                </p>
                            </div>
                            <Separator />
                            <ProfileForm user={{
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                            }} />
                        </TabsContent>

                        {isOrgAdmin && (
                            <TabsContent value="organization" className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium">Organization</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your organization details.
                                    </p>
                                </div>
                                <Separator />
                                <OrgForm organization={user.organization} />
                            </TabsContent>
                        )}

                        <TabsContent value="notifications" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Notifications</h3>
                                <p className="text-sm text-muted-foreground">
                                    Configure how you receive notifications.
                                </p>
                            </div>
                            <Separator />
                            <div className="text-sm text-muted-foreground p-4 border rounded-md">
                                Notification preferences coming soon.
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
