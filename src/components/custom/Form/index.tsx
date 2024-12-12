"use client";

import { UseFormReturn } from "react-hook-form";

import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export interface CustomFormProps {
  form: UseFormReturn<any>;
  children: React.ReactNode;
  className?: string;
  onSubmit: (data: any) => void | Promise<any>;
  onReset?: (data?: any) => void | Promise<any>;
}
export default function CustomForm(props: CustomFormProps) {
  const { children, form, className, onSubmit, onReset } = props;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={async () => {
          form.reset();
          if (onReset) {
            await onReset();
          }
        }}
        className={cn(className)}
      >
        {children}
      </form>
    </Form>
  );
}
