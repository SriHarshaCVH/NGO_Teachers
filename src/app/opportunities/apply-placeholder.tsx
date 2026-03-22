/** Apply flow is not implemented in Phase 1 discovery. */
export function ApplyPlaceholder() {
  return (
    <p>
      <button type="button" disabled>
        Apply
      </button>{" "}
      <span className="muted">Applications are not available yet.</span>
    </p>
  );
}
