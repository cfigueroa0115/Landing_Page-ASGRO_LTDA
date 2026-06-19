import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'rounded-btn bg-brand-green text-white shadow-btn hover:bg-brand-green-alt hover:shadow-elevated',
        destructive:
          'rounded-btn bg-red-500 text-white hover:bg-red-600',
        outline:
          'rounded-btn border-2 border-brand-blue bg-transparent text-brand-blue hover:bg-brand-blue hover:text-white',
        secondary:
          'rounded-btn bg-brand-light-gray text-brand-dark-blue hover:bg-gray-200',
        ghost:
          'rounded-btn hover:bg-brand-light-gray hover:text-brand-dark-blue',
        link: 'text-brand-blue underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[44px] px-3 py-1',
        sm: 'min-h-[44px] px-2 text-xs',
        lg: 'min-h-[48px] px-4 text-base',
        icon: 'min-h-[44px] min-w-[44px] h-[44px] w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
