"use client";

import { useFormState } from "react-dom";
import { loginAction, type LoginState } from "./actions";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";

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
    <form action={formAction} className="space-y-2">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      {registered ? (
        <Alert variant="info">
          Account created. You can log in below.
        </Alert>
      ) : null}
      {state?.error ? (
        <Alert variant="error">{state.error}</Alert>
      ) : null}
      <FormField id="login-email" label="Email">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>
      <FormField id="login-password" label="Password">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>
      <button type="submit">Log in</button>
    </form>
  );
}
