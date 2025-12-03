"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import turmaService from "@/services/Turmas";
import { GetTurmasDto } from "@/services/Turmas/dto/get-turmas.dto";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { FormControl } from "@/components/ui/form";
import { MultiSelect } from "@/components/mult-select";

type Checked = DropdownMenuCheckboxItemProps["checked"];
export function MultiSelectTurmas({
    ...field
}: ControllerRenderProps<FieldValues, "turmas">) {
    const turmas = [] as GetTurmasDto[];
    const [selectedTurmas, setSelectedTurmas] = useState<string[]>([]);

    const { data } = useQuery({
        queryKey: ["turmas"],
        queryFn: async () => await turmaService.getAllList(),
    });

    useEffect(() => {
        field.onChange(selectedTurmas);
    }, [selectedTurmas]);

    return (
        <FormControl>
            <MultiSelect
                options={
                    data?.map((turma) => {
                        return { value: turma.id, label: turma.nome };
                    }) || []
                }
                onValueChange={setSelectedTurmas}
                defaultValue={selectedTurmas}
                placeholder="Selecione as turmas"
                variant="default"
                animation={2}
                maxCount={3}
            />
        </FormControl>
    );
}
