import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  className, 
  ...props 
}, ref) => {
  const baseStyles = "font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md focus:ring-red-500",
    secondary: "bg-stone-200 hover:bg-stone-300 text-stone-800 shadow-sm hover:shadow-md focus:ring-stone-400",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md focus:ring-red-500",
    ghost: "bg-transparent hover:bg-stone-100 text-stone-700 hover:text-stone-900",
    outline: "bg-transparent border border-stone-300 hover:border-red-300 text-stone-700 hover:text-red-600",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
