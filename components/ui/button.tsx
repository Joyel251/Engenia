"use client";

import * as React from "react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
        "bg-blue-600 text-white hover:bg-blue-500",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});