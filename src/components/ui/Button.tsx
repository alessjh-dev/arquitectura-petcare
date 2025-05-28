import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  // asChild declarado pero no usado, si no lo vas a usar, mejor eliminarlo:
  // asChild?: boolean; 
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    // Cambiar let por const porque nunca reasignas estas variables
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

    let variantClasses = "";
    switch (variant) {
      case 'destructive':
        variantClasses = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
        break;
      case 'outline':
        variantClasses = "border border-input hover:bg-accent hover:text-accent-foreground";
        break;
      case 'secondary':
        variantClasses = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
        break;
      case 'ghost':
        variantClasses = "hover:bg-accent hover:text-accent-foreground";
        break;
      case 'link':
        variantClasses = "underline-offset-4 hover:underline text-primary";
        break;
      default: 
        variantClasses = "bg-primary text-primary-foreground hover:bg-primary/90";
        break;
    }

    let sizeClasses = "";
    switch (size) {
      case 'sm':
        sizeClasses = "h-9 px-3 rounded-md";
        break;
      case 'lg':
        sizeClasses = "h-11 px-8 rounded-md";
        break;
      case 'icon':
        sizeClasses = "h-10 w-10";
        break;
      default: 
        sizeClasses = "h-10 py-2 px-4";
        break;
    }

    const Comp = "button";

    return (
      <Comp
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
