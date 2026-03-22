"use client";

import { useFormState } from "react-dom";
import { loginAction, type LoginState } from "./actions";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: LoginState = {};

export function LoginForm({
  registered,
  callbackUrl,
}: {
  registered: boolean;
  callbackUrl?: string;
}) {
  const [state, formAction] = useFormState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-1">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      {registered ? (
        <Alert variant="info" title="Account created" className="mb-6">
          <p className="m-0">You can log in below.</p>
        </Alert>
      ) : null}
      {state?.error ? (
        <Alert variant="error" title="Could not log in" className="mb-6">
          <p className="m-0">{state.error}</p>
        </Alert>
      ) : null}
      <FormField id="login-email" label="Email">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          inputMode="email"
        />
      </FormField>
      <FormField id="login-password" label="Password">
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>
      <div className="pt-2">
        <Button type="submit" className="w-full sm:w-auto">
          Log in
        </Button>
      </div>
    </form>
  );
}
