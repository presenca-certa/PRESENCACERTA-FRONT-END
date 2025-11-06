"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { useForm, SubmitHandler } from "react-hook-form";
import { AuthCredentials } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    // 1. Usando o hook!
    // A lógica de loading e error vem de dentro dele
    const { loading, error, authRegister } = useAuth();

    // 2. Hook para gerenciar o formulário
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthCredentials>({
        // Usando o tipo compartilhado
        mode: "onBlur",
    });

    // 3. Função onSubmit (agora muito mais simples)
    const onSubmit: SubmitHandler<AuthCredentials> = async (data) => {
        // Apenas chama a função do hook
        const success = await authRegister(data);

        if (success) {
            // Sucesso!
            console.log("Conta criada com sucesso!");
            // Opcional: Redirecionar o usuário
            // Por exemplo: window.location.href = '/login';
        }
        // Se der falha, o hook 'useAuth' já
        // atualizou o 'error', e o componente
        // exibirá a mensagem de erro automaticamente.
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-lg">
                        Vamos criar sua conta
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {/* O feedback de erro funciona exatamente como antes */}
                    {error && (
                        <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* O formulário não muda */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className={cn("flex flex-col", className)}
                        {...props}
                    >
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Input
                                    isRequired
                                    label="E-mail"
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    {...register("email", {
                                        required: "O e-mail é obrigatório.",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message:
                                                "Endereço de e-mail inválido.",
                                        },
                                    })}
                                    error={errors.email?.message}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Input
                                    isRequired
                                    label="Senha"
                                    id="password"
                                    type="password"
                                    withTogglePassword
                                    forgotPassword={false}
                                    autoComplete="current-password"
                                    {...register("password", {
                                        required: "A senha é obrigatória.",
                                        minLength: {
                                            value: 8,
                                            message:
                                                "A senha deve ter pelo menos 8 caracteres.",
                                        },
                                    })}
                                    error={errors.password?.message}
                                />
                            </div>

                            {/* O feedback de loading funciona exatamente como antes */}
                            <Button
                                type="submit"
                                className="w-full text-primary-foreground"
                                disabled={loading}
                            >
                                {loading ? "Criando conta..." : "Criar Conta"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="w-full justify-center gap-1 text-sm">
                    Já tem uma conta?
                    <Link
                        href="/login"
                        className="underline underline-offset-4 hover:text-primary hover:font-medium"
                    >
                        Fazer login
                    </Link>
                </CardFooter>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                Ao clicar em entrar, você concorda com nossos{" "}
                <a href="#">Termos de Serviço</a> e{" "}
                <a href="#">Política de Privacidade</a>.
            </div>
        </div>
    );
}
