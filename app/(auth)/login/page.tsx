import { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/forms/login-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Login - Estate Management",
    description: "Sign in to your account",
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
            <Card className="glass-panel w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-medium text-primary hover:underline">
                            Create one
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
