"use client";

import React from "react";
import { Page } from "@/components/page";
import { DashboardCard } from "@/components/dashboard-card";

export default function AdminDashboard() {
    return (
        <Page>
            <h1 className="text-3xl font-bold pb-4 mb-4 border-b-2">
                Painel Administrativo
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Usuários"
                    description="Gerenciar usuários do sistema"
                    href="/admin/usuarios"
                    colorScheme="blue"
                />
                <DashboardCard
                    title="Pessoas"
                    description="Gerenciar pessoas do sistema"
                    href="/admin/pessoas"
                    colorScheme="green"
                />
                <DashboardCard
                    title="Turmas"
                    description="Gerenciar turmas e classes"
                    href="/admin/turmas"
                    colorScheme="purple"
                />
                <DashboardCard
                    title="Eventos"
                    description="Gerenciar eventos e frequência"
                    href="/admin/eventos"
                    colorScheme="yellow"
                />
                <DashboardCard
                    title="Localizações"
                    description="Gerenciar localizações de eventos"
                    href="/admin/localizacoes"
                    colorScheme="red"
                />
                <DashboardCard
                    title="Matérias"
                    description="Gerenciar matérias e disciplinas"
                    href="/admin/materias"
                    colorScheme="indigo"
                />
            </div>
        </Page>
    );
}
