"use client";

import type { ButtonHTMLAttributes } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type ConfirmSubmitProps = ButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    confirmMessage: string;
  };

export function ConfirmSubmit({ confirmMessage, onClick, ...props }: ConfirmSubmitProps) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
    />
  );
}
