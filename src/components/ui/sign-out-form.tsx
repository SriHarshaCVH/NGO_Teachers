import { logoutAction } from "@/app/auth/actions";
import { cn } from "@/lib/cn";
import { buttonAppearanceClassName } from "./button-styles";

export type SignOutFormProps = {
  className?: string;
  /** Visible label; keep "Sign out" for consistent chrome. */
  label?: string;
};

/**
 * Server-friendly sign-out control (uses existing `logoutAction`; no client JS).
 */
export function SignOutForm({ className, label = "Sign out" }: SignOutFormProps) {
  return (
    <form action={logoutAction} className={cn("inline", className)}>
      <button
        type="submit"
        className={buttonAppearanceClassName(
          "ghost",
          "sm",
          "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
      </button>
    </form>
  );
}
