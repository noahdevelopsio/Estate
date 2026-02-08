import { auth } from "@/lib/auth"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    const isAuthRoute = nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register")
    const isPublicRoute = nextUrl.pathname === "/"
    const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard")

    // Redirect authenticated users away from auth pages
    if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl))
    }

    // Redirect unauthenticated users to login
    if (!isLoggedIn && isProtectedRoute) {
        return Response.redirect(new URL("/login", nextUrl))
    }

    return null
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
