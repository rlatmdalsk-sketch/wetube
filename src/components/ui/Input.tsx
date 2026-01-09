import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    registration?: Partial<UseFormRegisterReturn>;
    containerClassName?: string;
    labelClassName?: string;
}

function Input({
    className,
    containerClassName,
    labelClassName,
    label,
    error,
    registration,
    ...props
}: InputProps) {
    return (
        <div className={twMerge(["flex", "flex-col", "gap-1"], ["w-full"], containerClassName)}>
            {label && (
                <label
                    className={twMerge([
                        "text-sm",
                        "font-medium",
                        "text-text-default",
                        labelClassName,
                    ])}>
                    {label}
                </label>
            )}
            <input
                className={twMerge(
                    ["w-full", "h-10", "px-3", "py-2"],
                    ["flex"],
                    ["text-sm", "text-text-default", "placeholder:text-text-disabled"],
                    ["border-divider", "border", "rounded-md", "bg-background-default"],
                    [
                        "focus:outline-none",
                        "focus:border-secondary-main",
                        "focus:ring-1",
                        "focus:ring-secondary-main",
                    ],
                    error && [
                        "border-error-main",
                        "focus:border-error-main",
                        "focus:ring-error-main",
                    ],
                    className,
                )}
                {...registration}
                {...props}
            />
            {error && <span className={twMerge(["text-xs", "text-error-main"])}>{error}</span>}
        </div>
    );
}

export default Input;
