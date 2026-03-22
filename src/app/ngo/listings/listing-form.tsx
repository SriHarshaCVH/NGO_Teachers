"use client";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

function firstFlattenMessage(details: {
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
}): string | undefined {
  const fe = details.fieldErrors;
  if (fe) {
    const first = Object.values(fe)
      .flat()
      .find((m): m is string => typeof m === "string" && m.length > 0);
    if (first) return first;
  }
  const root = details.formErrors;
  if (root?.length) return root[0];
  return undefined;
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
        details?: {
          fieldErrors?: Record<string, string[] | undefined>;
          formErrors?: string[];
        };
      };
      if (!res.ok) {
        const msg =
          (data.details && firstFlattenMessage(data.details)) ??
          data.error ??
          "Could not save listing";
        setError(msg);
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
        details?: {
          fieldErrors?: Record<string, string[] | undefined>;
          formErrors?: string[];
        };
      };
      if (!res.ok) {
        const msg =
          (data.details && firstFlattenMessage(data.details)) ??
          data.error ??
          "Could not update listing";
        setError(msg);
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
    <form onSubmit={onSubmit} className="space-y-8">
      {error ? (
        <Alert
          variant="error"
          title={
            showDraftPublish
              ? "Fix the issues below to save or publish"
              : "Could not update this listing"
          }
        >
          <p className="m-0">{error}</p>
          {showDraftPublish ? (
            <p className="mt-2 text-sm text-foreground/90">
              Publishing as <strong>Open</strong> runs full validation—every
              required field must be valid. Saving as <strong>Draft</strong> keeps
              your work without making the role public yet.
            </p>
          ) : null}
        </Alert>
      ) : null}

      <Alert variant="info" title="Draft vs open listings">
        {mode === "create" || initial?.status === "DRAFT" ? (
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong>Save as draft</strong> — stores your listing as{" "}
              <Badge variant="secondary" className="align-middle">
                Draft
              </Badge>
              . It is not visible on the public opportunities page.
            </li>
            <li>
              <strong>Publish (Open)</strong> — sets status to{" "}
              <Badge variant="success" className="align-middle">
                Open
              </Badge>{" "}
              so volunteers can discover and apply. All required fields must
              pass validation.
            </li>
          </ul>
        ) : initial?.status === "OPEN" ? (
          <p className="m-0 text-sm leading-relaxed">
            This listing is <strong>open</strong>. Use{" "}
            <strong>Save changes</strong> to update details while it stays live, or{" "}
            <strong>Close listing</strong> to stop new applications (status becomes{" "}
            <Badge variant="outline" className="align-middle">
              Closed
            </Badge>
            ).
          </p>
        ) : (
          <p className="m-0 text-sm leading-relaxed">
            This listing is <strong>closed</strong>. You can still edit details for
            your records; it will not accept new applications.
          </p>
        )}
      </Alert>

      <FormSection
        title="Role & requirements"
        description="What the volunteer will do and who it is for."
      >
        <FormField id="listing-title" label="Title" className="mb-0">
          <Input
            name="title"
            type="text"
            required
            maxLength={500}
            defaultValue={initial?.title ?? ""}
          />
        </FormField>
        <FormField
          id="listing-subjects"
          label="Subjects required"
          hint='Comma-separated labels (e.g. "Mathematics, Science"). Each becomes its own value for matching.'
          className="mb-0"
        >
          <Textarea
            name="subjectsRequired"
            required
            rows={2}
            className="min-h-[80px]"
            placeholder="e.g. Mathematics, Science"
            defaultValue={subjectsDefault}
          />
        </FormField>
        <FormField
          id="listing-age"
          label="Age group"
          hint="Who this role is intended for (e.g. primary, ages 10–12)."
          className="mb-0"
        >
          <Input
            name="ageGroup"
            type="text"
            required
            maxLength={200}
            defaultValue={initial?.ageGroup ?? ""}
          />
        </FormField>
        <FormField
          id="listing-qualifications"
          label="Qualifications"
          hint="Optional. Certifications, experience level, or background you prefer."
          className="mb-0"
        >
          <Textarea
            name="qualificationsText"
            rows={3}
            maxLength={2000}
            defaultValue={initial?.qualificationsText ?? ""}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Logistics"
        description="Where and how teaching happens, and how often."
      >
        <FormField
          id="listing-mode"
          label="Teaching mode"
          className="mb-0"
        >
          <Select
            name="mode"
            required
            defaultValue={initial?.mode ?? "ONLINE"}
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline (in person)</option>
            <option value="HYBRID">Hybrid</option>
          </Select>
        </FormField>
        <FormField id="listing-location" label="Location" className="mb-0">
          <Input
            name="location"
            type="text"
            required
            maxLength={500}
            defaultValue={initial?.location ?? ""}
          />
        </FormField>
        <FormField
          id="listing-time-commitment"
          label="Time commitment"
          className="mb-0"
        >
          <Input
            name="timeCommitment"
            type="text"
            required
            maxLength={500}
            defaultValue={initial?.timeCommitment ?? ""}
          />
        </FormField>
        <FormField id="listing-frequency" label="Frequency" className="mb-0">
          <Input
            name="frequency"
            type="text"
            required
            maxLength={200}
            defaultValue={initial?.frequency ?? ""}
          />
        </FormField>
        <FormField
          id="listing-language"
          label="Language preference"
          className="mb-0"
        >
          <Input
            name="languagePreference"
            type="text"
            required
            maxLength={200}
            defaultValue={initial?.languagePreference ?? ""}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Volunteers & application window"
        description="How many people you need and when applications close."
      >
        <FormField
          id="listing-volunteers"
          label="Volunteers needed"
          className="mb-0"
        >
          <Input
            name="volunteersNeeded"
            type="number"
            required
            min={1}
            max={10000}
            defaultValue={initial?.volunteersNeeded ?? 1}
          />
        </FormField>
        <FormField
          id="listing-deadline"
          label="Application deadline"
          hint="Local date and time—stored in UTC on the server."
          className="mb-0"
        >
          <Input
            name="applicationDeadline"
            type="datetime-local"
            required
            defaultValue={
              initial
                ? toDatetimeLocalInput(initial.applicationDeadline)
                : defaultDeadlineLocal()
            }
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Description for volunteers"
        description="Full detail applicants will read before applying."
      >
        <FormField id="listing-description" label="Description" className="mb-0">
          <Textarea
            name="description"
            required
            rows={6}
            maxLength={8000}
            defaultValue={initial?.description ?? ""}
          />
        </FormField>
      </FormSection>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:rounded-xl sm:border sm:bg-surface sm:px-6 sm:py-5 sm:shadow-soft">
        <div className="space-y-4">
          {showDraftPublish ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                type="submit"
                data-intent="draft"
                disabled={pending}
                loading={pending}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {pending ? "Saving…" : "Save as draft"}
              </Button>
              <Button
                type="submit"
                data-intent="publish"
                disabled={pending}
                loading={pending}
                variant="primary"
                className="w-full sm:w-auto"
              >
                {pending ? "Publishing…" : "Publish (Open)"}
              </Button>
            </div>
          ) : null}

          {showOpenSave ? (
            <Button
              type="submit"
              data-intent="save"
              disabled={pending}
              loading={pending}
              variant="primary"
              className="w-full sm:w-auto"
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
          ) : null}

          {showClosedSave ? (
            <Button
              type="submit"
              data-intent="save"
              disabled={pending}
              loading={pending}
              variant="primary"
              className="w-full sm:w-auto"
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
          ) : null}

          {showClose ? (
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Closing stops new applications. Existing applications are
                unchanged.
              </p>
              <Button
                type="submit"
                data-intent="close"
                disabled={pending}
                loading={pending}
                variant="danger"
                className="w-full sm:w-auto"
              >
                {pending ? "Closing…" : "Close listing"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}
