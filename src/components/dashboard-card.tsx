"use client";

import React from "react";
import Link from "next/link";

interface DashboardCardProps {
    title: string;
    description: string;
    href: string;
    colorScheme: "blue" | "green" | "purple" | "yellow" | "red" | "indigo";
}

const colorMap = {
    blue: {
        bg: "bg-blue-50",
        text: "text-blue-900",
        link: "text-blue-800 hover:text-blue-600",
    },
    green: {
        bg: "bg-green-50",
        text: "text-green-900",
        link: "text-green-800 hover:text-green-600",
    },
    purple: {
        bg: "bg-purple-50",
        text: "text-purple-900",
        link: "text-purple-800 hover:text-purple-600",
    },
    yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-900",
        link: "text-yellow-800 hover:text-yellow-600",
    },
    red: {
        bg: "bg-red-50",
        text: "text-red-900",
        link: "text-red-800 hover:text-red-600",
    },
    indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-900",
        link: "text-indigo-800 hover:text-indigo-600",
    },
};

export function DashboardCard({
    title,
    description,
    href,
    colorScheme,
}: DashboardCardProps) {
    const colors = colorMap[colorScheme];

    return (
        <Link href={href}>
            <div
                className={`${colors.bg} rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer h-full hover:scale-105`}
            >
                <h3 className={`text-xl font-semibold ${colors.text} mb-2`}>
                    {title}
                </h3>
                <p className="text-gray-600 mb-4">{description}</p>
                <span
                    className={`${colors.link} font-medium inline-block transition`}
                >
                    Ir →
                </span>
            </div>
        </Link>
    );
}
