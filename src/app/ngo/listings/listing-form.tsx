"use client";

import type { PublicListing } from "@/lib/listing";
import type { TeachingMode } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  mode: "create" | "edit";
  initial?: PublicListing | null;
};

function defaultDeadlineLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDatetimeLocalInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return defaultDeadlineLocal();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalToIso(local: string) {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function buildCommonFields(fd: FormData) {
  const subjectsRaw = String(fd.get("subjectsRequired") ?? "");
  const subjectsRequired = subjectsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const volunteersRaw = String(fd.get("volunteersNeeded") ?? "").trim();
  const volunteersNeeded = Number(volunteersRaw);

  const deadlineLocal = String(fd.get("applicationDeadline") ?? "").trim();
  const applicationDeadline = fromDatetimeLocalToIso(deadlineLocal);

  return {
    title: String(fd.get("title") ?? "").trim(),
    subjectsRequired,
    ageGroup: String(fd.get("ageGroup") ?? "").trim(),
    mode: String(fd.get("mode") ?? "") as TeachingMode,
    location: String(fd.get("location") ?? "").trim(),
    timeCommitment: String(fd.get("timeCommitment") ?? "").trim(),
    frequency: String(fd.get("frequency") ?? "").trim(),
    languagePreference: String(fd.get("languagePreference") ?? "").trim(),
    qualificationsText: String(fd.get("qualificationsText") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim(),
    volunteersNeeded,
    applicationDeadline,
  };
}

export function ListingForm({ mode, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const subjectsDefault = initial?.subjectsRequired.length
    ? initial.subjectsRequired.join(", ")
    : "";

  async function submitCreate(status: "DRAFT" | "OPEN", form: HTMLFormElement) {
    setError(null);
    setPending(true);
    const fd = new FormData(form);
    const payload = { ...buildCommonFields(fd), status };
    try {
      const res = await fetch("/api/ngo/listings", {
        method: "POST",
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
        setError(first ?? data.error ?? "Could not save listing");
        return;
      }
      router.push("/ngo/listings");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function submitPatch(body: Record<string, unknown>) {
    if (!initial?.id) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/ngo/listings/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
        setError(first ?? data.error ?? "Could not update listing");
        return;
      }
      router.push("/ngo/listings");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const intent = submitter?.getAttribute("data-intent");

    if (mode === "create") {
      if (intent === "publish") await submitCreate("OPEN", form);
      else await submitCreate("DRAFT", form);
      return;
    }

    if (!initial) return;

    const fd = new FormData(form);

    if (intent === "close") {
      await submitPatch({ status: "CLOSED" });
      return;
    }

    const fields = buildCommonFields(fd);

    if (initial.status === "OPEN" && intent === "save") {
      await submitPatch(fields);
      return;
    }

    if (initial.status === "DRAFT") {
      if (intent === "publish") {
        await submitPatch({ ...fields, status: "OPEN" });
        return;
      }
      if (intent === "draft") {
        await submitPatch({ ...fields, status: "DRAFT" });
        return;
      }
    }

    if (initial.status === "CLOSED" && intent === "save") {
      await submitPatch(fields);
      return;
    }
  }

  const showDraftPublish =
    mode === "create" || initial?.status === "DRAFT";
  const showOpenSave =
    mode === "edit" && initial?.status === "OPEN";
  const showClosedSave =
    mode === "edit" && initial?.status === "CLOSED";
  const showClose =
    mode === "edit" &&
    initial &&
    (initial.status === "DRAFT" || initial.status === "OPEN");

  return (
    <form onSubmit={onSubmit}>
      {error ? <p className="error">{error}</p> : null}
      <fieldset>
        <legend>Listing details</legend>
        <label>
          Title
          <input
            name="title"
            type="text"
            required
            maxLength={500}
            defaultValue={initial?.title ?? ""}
          />
        </label>
        <label>
          Subjects required
          <textarea
            name="subjectsRequired"
            required
            rows={2}
            placeholder="e.g. Mathematics, Science"
            defaultValue={subjectsDefault}
          />
        </label>
        <p className="field-hint">
          Comma-separated. Stored as a list (e.g. <code>Mathematics</code>,{" "}
          <code>Science</code>).
        </p>
        <label>
          Age group
          <input
            name="ageGroup"
            type="text"
            required
            maxLength={200}
            defaultValue={initial?.ageGroup ?? ""}
          />
        </label>
        <label>
          Mode
          <select
            name="mode"
            required
            defaultValue={initial?.mode ?? "ONLINE"}
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </label>
        <label>
          Location
          <input
            name="location"
            type="text"
            required
            maxLength={500}
            defaultValue={initial?.location ?? ""}
          />
        </label>
        <label>
          Time commitment
          <input
            name="timeCommitment"
            type="text"
            required
            maxLength={500}
            defaultValue={initial?.timeCommitment ?? ""}
          />
        </label>
        <label>
          Frequency
          <input
            name="frequency"
            type="text"
            required
            maxLength={200}
            defaultValue={initial?.frequency ?? ""}
          />
        </label>
        <label>
          Language preference
          <input
            name="languagePreference"
            type="text"
            required
            maxLength={200}
            defaultValue={initial?.languagePreference ?? ""}
          />
        </label>
        <label>
          Qualifications (optional)
          <textarea
            name="qualificationsText"
            rows={3}
            maxLength={2000}
            defaultValue={initial?.qualificationsText ?? ""}
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            required
            rows={6}
            maxLength={8000}
            defaultValue={initial?.description ?? ""}
          />
        </label>
        <label>
          Volunteers needed
          <input
            name="volunteersNeeded"
            type="number"
            required
            min={1}
            max={10000}
            defaultValue={initial?.volunteersNeeded ?? 1}
          />
        </label>
        <label>
          Application deadline
          <input
            name="applicationDeadline"
            type="datetime-local"
            required
            defaultValue={
              initial
                ? toDatetimeLocalInput(initial.applicationDeadline)
                : defaultDeadlineLocal()
            }
          />
        </label>
      </fieldset>

      {showDraftPublish ? (
        <p>
          <button
            type="submit"
            data-intent="draft"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save as draft"}
          </button>{" "}
          <button
            type="submit"
            data-intent="publish"
            disabled={pending}
          >
            {pending ? "Publishing…" : "Publish (OPEN)"}
          </button>
        </p>
      ) : null}

      {showOpenSave ? (
        <p>
          <button
            type="submit"
            data-intent="save"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </p>
      ) : null}

      {showClosedSave ? (
        <p>
          <button
            type="submit"
            data-intent="save"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </p>
      ) : null}

      {showClose ? (
        <p>
          <button
            type="submit"
            data-intent="close"
            disabled={pending}
          >
            {pending ? "Closing…" : "Close listing"}
          </button>
        </p>
      ) : null}
    </form>
  );
}
