"use client";

import type { PublicVolunteerProfile } from "@/lib/volunteer-profile";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TEACHING_MODES = ["ONLINE", "OFFLINE", "HYBRID"] as const;
type TeachingModeValue = (typeof TEACHING_MODES)[number];

type Props = {
  initialProfile: PublicVolunteerProfile | null;
};

function joinList(values: string[] | undefined) {
  return values?.length ? values.join(", ") : "";
}

export function VolunteerProfileForm({ initialProfile }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const splitList = (name: string) => {
      const raw = String(fd.get(name) ?? "");
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const preferredModeRaw = String(fd.get("preferredMode") ?? "");
    if (!TEACHING_MODES.includes(preferredModeRaw as TeachingModeValue)) {
      setError("Select a valid teaching mode");
      return;
    }

    const resumeRaw = String(fd.get("resumeUrl") ?? "").trim();

    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      bio: String(fd.get("bio") ?? "").trim(),
      location: String(fd.get("location") ?? "").trim(),
      educationBackground: String(fd.get("educationBackground") ?? "").trim(),
      subjects: splitList("subjects"),
      ageGroupsComfort: splitList("ageGroupsComfort"),
      languages: splitList("languages"),
      preferredMode: preferredModeRaw as TeachingModeValue,
      availability: String(fd.get("availability") ?? "").trim(),
      priorExperience: String(fd.get("priorExperience") ?? "").trim(),
      resumeUrl: resumeRaw === "" ? undefined : resumeRaw,
    };

    setPending(true);
    try {
      const res = await fetch("/api/volunteer/profile", {
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
      router.push("/volunteer");
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
        <legend>About you</legend>
        <label>
          Full name
          <input
            name="fullName"
            type="text"
            required
            maxLength={500}
            defaultValue={initialProfile?.fullName ?? ""}
            autoComplete="name"
          />
        </label>
        <label>
          Bio
          <textarea
            name="bio"
            required
            rows={5}
            maxLength={8000}
            defaultValue={initialProfile?.bio ?? ""}
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
          Education background
          <textarea
            name="educationBackground"
            required
            rows={3}
            maxLength={4000}
            defaultValue={initialProfile?.educationBackground ?? ""}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>Teaching</legend>
        <label>
          Subjects
          <textarea
            name="subjects"
            required
            rows={2}
            placeholder="e.g. Math, English, Science"
            defaultValue={joinList(initialProfile?.subjects)}
          />
        </label>
        <label>
          Age groups you are comfortable with
          <textarea
            name="ageGroupsComfort"
            required
            rows={2}
            placeholder="e.g. 6-10, 11-14"
            defaultValue={joinList(initialProfile?.ageGroupsComfort)}
          />
        </label>
        <label>
          Languages
          <textarea
            name="languages"
            required
            rows={2}
            placeholder="e.g. English, Hindi"
            defaultValue={joinList(initialProfile?.languages)}
          />
        </label>
        <p className="field-hint">
          Comma-separated labels. Each list is stored for matching later.
        </p>
        <label>
          Preferred mode
          <select
            name="preferredMode"
            required
            defaultValue={initialProfile?.preferredMode ?? "HYBRID"}
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </label>
        <label>
          Availability
          <textarea
            name="availability"
            required
            rows={3}
            maxLength={4000}
            defaultValue={initialProfile?.availability ?? ""}
          />
        </label>
        <label>
          Prior experience
          <textarea
            name="priorExperience"
            required
            rows={4}
            maxLength={8000}
            defaultValue={initialProfile?.priorExperience ?? ""}
          />
        </label>
        <label>
          Resume URL (optional)
          <input
            name="resumeUrl"
            type="url"
            maxLength={2000}
            placeholder="https://"
            defaultValue={initialProfile?.resumeUrl ?? ""}
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
