"use client";

import { useFormState } from "react-dom";
import { loginAction, type LoginState } from "./actions";

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
    <form action={formAction}>
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}
      {registered ? (
        <p className="notice">Account created. You can log in below.</p>
      ) : null}
      {state?.error ? <p className="error">{state.error}</p> : null}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <button type="submit">Log in</button>
    </form>
  );
}
