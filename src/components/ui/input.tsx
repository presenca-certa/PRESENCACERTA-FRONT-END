"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "./label";

type InputPassProps = React.ComponentProps<"input"> & {
    label: string;
    withTogglePassword?: boolean;
    forgotPassword?: boolean;
    error?: string;
    isRequired: boolean;
    autoComplete?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputPassProps>(
    (
        {
            label,
            className,
            forgotPassword = true,
            type,
            withTogglePassword,
            error,
            isRequired = false,
            autoComplete,
            ...props
        },
        ref,
    ) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === "password" && withTogglePassword;
        const isForgotPassword = type === "password" && forgotPassword;
        const hasError = !!error;

        return (
            <div className="grid gap-3">
                <div className="flex justify-between">
                    <Label className="gap-1" htmlFor={props.id || type}>
                        {label}
                        {isRequired === true ? (
                            <span className="font-medium text-red-600 p-0">
                                *
                            </span>
                        ) : (
                            ""
                        )}
                    </Label>
                    {isForgotPassword ? (
                        <a
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                            href="/recuperar-senha"
                        >
                            Esqueceu sua senha
                        </a>
                    ) : (
                        ""
                    )}
                </div>

                <div className="relative">
                    <input
                        ref={ref}
                        type={isPassword && showPassword ? "text" : type}
                        data-slot="input"
                        className={cn(
                            "bg-popover file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border  px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                            className,
                            hasError && "border-destructive",
                        )}
                        {...props}
                        aria-invalid={hasError}
                        autoComplete={autoComplete}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 rounded-sm absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    )}
                </div>
                {hasError && (
                    <p className="text-destructive text-sm font-medium mt-1">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";

export { Input };
