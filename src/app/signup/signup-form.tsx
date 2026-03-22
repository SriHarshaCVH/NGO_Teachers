"use client";

import { useFormState } from "react-dom";
import { signupAction, type SignupState } from "./actions";

const initial: SignupState = {};

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initial);

  return (
    <form action={formAction}>
      {state?.error ? <p className="error">{state.error}</p> : null}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password (min 8 characters)
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <fieldset>
        <legend>Role</legend>
        <label>
          <input name="role" type="radio" value="NGO" required /> NGO
        </label>
        <label>
          <input name="role" type="radio" value="VOLUNTEER" /> Volunteer
        </label>
      </fieldset>
      <button type="submit">Create account</button>
    </form>
  );
}
