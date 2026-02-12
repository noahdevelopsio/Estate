"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

type OrgContextType = {
    currentOrgId: string | null
    setCurrentOrgId: (id: string) => void
}

const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function OrgProvider({
    children,
    session
}: {
    children: React.ReactNode
    session: Session | null
}) {
    const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)

    // Initialize from session or local storage if needed
    useEffect(() => {
        if (session?.user?.id) {
            // Logic to set default org could go here
        }
    }, [session])

    return (
        <SessionProvider session={session}>
            <OrgContext.Provider value={{ currentOrgId, setCurrentOrgId }}>
                {children}
            </OrgContext.Provider>
        </SessionProvider>
    )
}

export const useOrg = () => {
    const context = useContext(OrgContext)
    if (context === undefined) {
        throw new Error("useOrg must be used within an OrgProvider")
    }
    return context
}
