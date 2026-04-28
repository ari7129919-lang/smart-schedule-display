import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export const CardHeader: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export const CardTitle: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export const CardDescription: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export const CardContent: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export const CardFooter: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
