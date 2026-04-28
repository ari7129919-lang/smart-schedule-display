// @ts-nocheck
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(
  /** @type {React.ForwardRefRenderFunction<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>} */
  (props, ref) => {
    const { className, ...rest } = props;
    return (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...rest} />
    );
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef(
  /** @type {React.ForwardRefRenderFunction<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>} */
  (props, ref) => {
    const { className, ...rest } = props;
    return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...rest} />
    );
  }
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(
  /** @type {React.ForwardRefRenderFunction<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>} */
  (props, ref) => {
    const { className, ...rest } = props;
    return (
    <div
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...rest} />
    );
  }
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(
  /** @type {React.ForwardRefRenderFunction<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>} */
  (props, ref) => {
    const { className, ...rest } = props;
    return (
    <div
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...rest} />
    );
  }
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(
  /** @type {React.ForwardRefRenderFunction<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>} */
  (props, ref) => {
    const { className, ...rest } = props;
    return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...rest} />
    );
  }
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(
  /** @type {React.ForwardRefRenderFunction<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>} */
  (props, ref) => {
    const { className, ...rest } = props;
    return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...rest} />
    );
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
