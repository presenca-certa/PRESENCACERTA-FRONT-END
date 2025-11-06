import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/toaster";
import MenuBar from "@/components/menu-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "UNICHAMADA",
    description: "CHAMADA ONLINE DA UNINASSAU",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <html className="h-screen" lang="pt-br">
                <body className="flex min-h-screen w-full flex-col bg-slate-100 ">
                    {children}
                </body>
            </html>
        </QueryProvider>
    );
}
