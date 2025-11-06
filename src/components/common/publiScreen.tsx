import Image from "next/image";
import { PropsWithChildren } from "react";

export function PublicScreen({ children }: PropsWithChildren) {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a
                    href="#"
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="bg-primary text-primary-foreground flex size-10 p-1  items-center justify-center rounded-md">
                        <Image
                            width={40}
                            height={40}
                            src="https://logo.uninassau.edu.br/img/svg/favicon_uninassau.svg"
                            alt="logo zanolli amarela com azul"
                        />
                    </div>
                    Presença certa
                </a>
                {children}
            </div>
        </div>
    );
}
