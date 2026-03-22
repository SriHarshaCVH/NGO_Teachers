"use client";

import { useFormState } from "react-dom";
import { signupAction, type SignupState } from "./actions";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";

const initial: SignupState = {};

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initial);

  return (
    <form action={formAction} className="space-y-2">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      <FormField id="signup-email" label="Email">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>
      <FormField
        id="signup-password"
        label="Password (min 8 characters)"
      >
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </FormField>
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
