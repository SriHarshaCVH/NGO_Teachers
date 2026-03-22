"use client";

import { useFormState } from "react-dom";
import { signupAction, type SignupState } from "./actions";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const initial: SignupState = {};

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initial);

  return (
    <form action={formAction} className="space-y-1">
      {state?.error ? (
        <Alert variant="error" className="mb-6">
          {state.error}
        </Alert>
      ) : null}
      <FormField id="signup-email" label="Email">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          inputMode="email"
        />
      </FormField>
      <FormField
        id="signup-password"
        label="Password"
        hint="Use at least 8 characters."
      >
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </FormField>

      <fieldset className="mb-6 mt-2 space-y-3 border-0 bg-transparent p-0 shadow-none">
        <legend className="mb-3 text-sm font-medium text-foreground">
          I am signing up as
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="cursor-pointer">
            <input
              name="role"
              type="radio"
              value="NGO"
              required
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-[5.5rem] flex-col justify-center rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                "peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-focus-ring/35"
              )}
            >
              <span className="text-sm font-semibold text-foreground">NGO</span>
              <span className="mt-1 text-xs leading-snug text-muted-foreground">
                Post opportunities and review applicants for your programs.
              </span>
            </span>
          </label>
          <label className="cursor-pointer">
            <input
              name="role"
              type="radio"
              value="VOLUNTEER"
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-[5.5rem] flex-col justify-center rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                "peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-focus-ring/35"
              )}
            >
              <span className="text-sm font-semibold text-foreground">
                Volunteer
              </span>
              <span className="mt-1 text-xs leading-snug text-muted-foreground">
                Share your teaching skills and apply to roles that fit.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="pt-1">
        <Button type="submit" className="w-full sm:w-auto">
          Create account
        </Button>
      </div>
    </form>
  );
}
