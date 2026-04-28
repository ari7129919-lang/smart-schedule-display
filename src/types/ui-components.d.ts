declare module '@/components/ui/card' {
  import * as React from 'react';
  interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
  export const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const CardHeader: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const CardTitle: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const CardDescription: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const CardContent: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const CardFooter: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/button' {
  import * as React from 'react';
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
}

declare module '@/components/ui/input' {
  import * as React from 'react';
  export const Input: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
}

declare module '@/components/ui/label' {
  import * as React from 'react';
  export const Label: React.ForwardRefExoticComponent<React.LabelHTMLAttributes<HTMLLabelElement> & React.RefAttributes<HTMLLabelElement>>;
}

declare module '@/components/ui/switch' {
  import * as React from 'react';
  import * as SwitchPrimitives from '@radix-ui/react-switch';
  export const Switch: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & React.RefAttributes<HTMLButtonElement>>;
}

declare module '@/components/ui/textarea' {
  import * as React from 'react';
  export const Textarea: React.ForwardRefExoticComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>>;
}

declare module '@/components/ui/badge' {
  import * as React from 'react';
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
  export function Badge(props: BadgeProps): React.ReactElement;
}
