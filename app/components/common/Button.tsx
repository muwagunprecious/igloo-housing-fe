import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/utils/cn"; // We need to create this utility

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-primary hover:bg-primary-hover text-white border-transparent",
            secondary: "bg-gray-900 hover:bg-black text-white border-transparent",
            outline: "bg-transparent border-gray-900 text-gray-900 hover:bg-gray-50",
            ghost: "bg-transparent hover:bg-gray-100 text-gray-900 border-transparent",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-5 py-2.5 text-base",
            lg: "px-8 py-3.5 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none border",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export default Button;
