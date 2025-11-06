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

interface ILoginFormInput {
    email: string;
    password: string;
}

export default function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-lg">
                        Bem-vindo
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <form className={cn("flex flex-col", className)} {...props}>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Input
                                    isRequired
                                    label="E-mail"
                                    id="email"
                                    type="email"
                                    autoComplete="username"
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
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-primary-foreground"
                            >
                                Login
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="w-full justify-center gap-1 text-sm">
                    Ainda não tem uma conta?
                    <Link
                        href="/criar-conta"
                        className="underline underline-offset-4 hover:text-primary hover:font-medium"
                    >
                        Criar uma conta
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
