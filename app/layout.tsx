import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { OrgProvider } from "@/components/providers/org-provider";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Estate Management",
  description: "Next-gen estate management platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} font-body bg-background text-foreground`}>
        <OrgProvider session={session}>
          {children}
          <Toaster />
        </OrgProvider>
      </body>
    </html>
  );
}
