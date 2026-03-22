import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p className="muted">
        The page may have been removed, or the link is incorrect.
      </p>
      <p>
        <Link href="/">Home</Link>
        {" · "}
        <Link href="/opportunities">Browse opportunities</Link>
      </p>
    </main>
  );
}
