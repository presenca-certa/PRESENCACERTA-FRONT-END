"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
    FormField,
} from "@/components/ui/form";

import { DatePicker } from "./data-picker";
import { InputForm } from "./input-form";
import { MultiSelectTurmas } from "./mult-selected-turmas";
import { useMutation } from "@tanstack/react-query";
import eventoService from "@/services/Evento";
import * as datefns from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface IEvento {
    nome: string;
    turmas: number[];
    dataInicio: Date;
    horaInicio: string;
    horaFim: string;
}

export function FormAdicionaEvento() {
    const form = useForm();
    const router = useRouter();
    const { toast } = useToast();
    const { mutate, isPending } = useMutation<any, Error, IEvento>({
        mutationFn: async (data) => {
            const [horaInicioNumber, minutoInicioNumber] = data.horaInicio
                .split(":")
                .map(Number);
            const [horaFimNumber, minutoFimNumber] = data.horaFim
                .split(":")
                .map(Number);

            const horaInicio = datefns.setHours(
                datefns.setMinutes(
                    new Date(data.dataInicio),
                    minutoInicioNumber,
                ),
                horaInicioNumber,
            );
            const horaFim = datefns.setHours(
                datefns.setMinutes(new Date(data.dataInicio), minutoFimNumber),
                horaFimNumber,
            );

            await EventoService.createEvento({
                nome: data.nome,
                turmas: data.turmas,
                dataInicio: data.dataInicio,
                horaInicio: horaInicio,
                horaFim: horaFim,
            });
        },
        onSuccess: (data) => {
            toast({
                title: "Evento cadastrado com sucesso",
                duration: 5000,
            });

            router.push("/evento");
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(mutate)}
                className="w-full space-y-6"
            >
                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do evento</FormLabel>
                            <FormControl>
                                <InputForm
                                    placeholder="Insira um nome para o evento"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="turmas"
                    render={({ field }) => (
                        <FormItem className="flex min-w-screen w-full flex-col">
                            <FormLabel>Selecione uma turma</FormLabel>
                            <FormControl className="flex min-w-screen w-full flex-col ">
                                <MultiSelectTurmas {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dataInicio"
                    render={({ field }) => (
                        <FormItem className="flex min-w-screen w-full flex-col">
                            <FormLabel>Data do evento</FormLabel>
                            <FormControl className="flex min-w-screen w-full flex-col ">
                                <DatePicker {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 w-auto">
                    <FormField
                        control={form.control}
                        name="horaInicio"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Inicio do evento</FormLabel>
                                <FormControl>
                                    <InputForm
                                        type="time"
                                        placeholder="Insira a hora inicio do evento"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="horaFim"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Fim do evento</FormLabel>
                                <FormControl>
                                    <InputForm
                                        type="time"
                                        placeholder="Insira a hora fim do evento"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end w-full">
                    <Button
                        loading={isPending}
                        type="submit"
                        className="w-full md:w-auto bg-blue-800 rounded-lg text-blue-50 hover:bg-blue-700 mb-8"
                    >
                        Cadastrar
                    </Button>
                </div>
            </form>
        </Form>
    );
}
