"use client";

import type { PublicNgoProfile } from "@/lib/ngo-profile";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialProfile: PublicNgoProfile | null;
};

export function NgoProfileForm({ initialProfile }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const ageGroupsDefault = initialProfile?.ageGroupsServed.length
    ? initialProfile.ageGroupsServed.join(", ")
    : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const ageRaw = String(fd.get("ageGroupsServed") ?? "");
    const ageGroupsServed = ageRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      location: String(fd.get("location") ?? "").trim(),
      ageGroupsServed,
      contactPersonName: String(fd.get("contactPersonName") ?? "").trim(),
      contactEmail: String(fd.get("contactEmail") ?? "").trim(),
      contactPhone: String(fd.get("contactPhone") ?? "").trim(),
      websiteOrSocial: String(fd.get("websiteOrSocial") ?? "").trim(),
    };

    setPending(true);
    try {
      const res = await fetch("/api/ngo/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[] | undefined> };
      };
      if (!res.ok) {
        const fe = data.details?.fieldErrors;
        const first =
          fe &&
          Object.values(fe)
            .flat()
            .find((m): m is string => typeof m === "string" && m.length > 0);
        setError(first ?? data.error ?? "Could not save profile");
        return;
      }
      router.push("/ngo");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {error ? <p className="error">{error}</p> : null}
      <fieldset>
        <legend>Organization</legend>
        <label>
          Organization name
          <input
            name="name"
            type="text"
            required
            maxLength={500}
            defaultValue={initialProfile?.name ?? ""}
            autoComplete="organization"
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            required
            rows={5}
            maxLength={8000}
            defaultValue={initialProfile?.description ?? ""}
          />
        </label>
        <label>
          Location
          <input
            name="location"
            type="text"
            required
            maxLength={500}
            defaultValue={initialProfile?.location ?? ""}
            autoComplete="address-level1"
          />
        </label>
        <label>
          Age groups served
          <textarea
            name="ageGroupsServed"
            required
            rows={2}
            placeholder="e.g. 6-10, 11-14, 15-18"
            defaultValue={ageGroupsDefault}
          />
        </label>
        <p className="field-hint">
          Comma-separated labels. Stored as a list (e.g. <code>6-10</code>,{" "}
          <code>11-14</code>).
        </p>
      </fieldset>
      <fieldset>
        <legend>Contact</legend>
        <label>
          Contact person name
          <input
            name="contactPersonName"
            type="text"
            required
            maxLength={200}
            defaultValue={initialProfile?.contactPersonName ?? ""}
            autoComplete="name"
          />
        </label>
        <label>
          Contact email
          <input
            name="contactEmail"
            type="email"
            required
            maxLength={320}
            defaultValue={initialProfile?.contactEmail ?? ""}
            autoComplete="email"
          />
        </label>
        <label>
          Contact phone
          <input
            name="contactPhone"
            type="tel"
            required
            maxLength={40}
            defaultValue={initialProfile?.contactPhone ?? ""}
            autoComplete="tel"
          />
        </label>
        <label>
          Website or social link (optional)
          <input
            name="websiteOrSocial"
            type="text"
            maxLength={2000}
            defaultValue={initialProfile?.websiteOrSocial ?? ""}
            autoComplete="url"
          />
        </label>
      </fieldset>
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
