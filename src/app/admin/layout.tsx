"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuBar from "@/components/menu-bar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    // useEffect(() => {
    //     const user = localStorage.getItem("user");
    //     if (!user) {
    //         router.push("/login");
    //     }
    // }, [router]);

    return (
        <div className="flex">
            {/* <MenuBar /> */}
            <div className="flex-1 w-full">{children}</div>
        </div>
    );
}
