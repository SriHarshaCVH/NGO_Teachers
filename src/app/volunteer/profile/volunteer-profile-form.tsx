"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
    <form onSubmit={onSubmit} className="space-y-8">
      {error ? (
        <Alert variant="error" title="Could not save profile">
          <p className="m-0">{error}</p>
        </Alert>
      ) : null}

      <FormSection
        title="Identity & background"
        description="Who you are and your teaching story. All fields in this section are required."
      >
        <FormField id="vol-full-name" label="Full name" className="mb-0">
          <Input
            name="fullName"
            type="text"
            required
            maxLength={500}
            defaultValue={initialProfile?.fullName ?? ""}
            autoComplete="name"
          />
        </FormField>
        <FormField
          id="vol-bio"
          label="Bio"
          hint="A few sentences about you and why you volunteer to teach."
          className="mb-0"
        >
          <Textarea
            name="bio"
            required
            rows={5}
            maxLength={8000}
            defaultValue={initialProfile?.bio ?? ""}
          />
        </FormField>
        <FormField
          id="vol-location"
          label="Location"
          hint="Where you are usually based (city, region, or country)."
          className="mb-0"
        >
          <Input
            name="location"
            type="text"
            required
            maxLength={500}
            defaultValue={initialProfile?.location ?? ""}
            autoComplete="address-level1"
          />
        </FormField>
        <FormField
          id="vol-education"
          label="Education background"
          hint="Degrees, certifications, or training that support your teaching."
          className="mb-0"
        >
          <Textarea
            name="educationBackground"
            required
            rows={3}
            maxLength={4000}
            defaultValue={initialProfile?.educationBackground ?? ""}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Subjects & languages"
        description='List items separated by commas. Each comma-separated piece is stored as its own value (e.g. "Math, English" → two subjects).'
      >
        <FormField
          id="vol-subjects"
          label="Subjects you can teach"
          hint='Example: "Mathematics, English, Environmental science"'
          className="mb-0"
        >
          <Textarea
            name="subjects"
            required
            rows={2}
            className="min-h-[80px]"
            placeholder="e.g. Math, English, Science"
            defaultValue={joinList(initialProfile?.subjects)}
          />
        </FormField>
        <FormField
          id="vol-age-groups"
          label="Age groups you are comfortable with"
          hint='Example: "6-10, 11-14" — same comma rules as subjects.'
          className="mb-0"
        >
          <Textarea
            name="ageGroupsComfort"
            required
            rows={2}
            className="min-h-[80px]"
            placeholder="e.g. 6-10, 11-14"
            defaultValue={joinList(initialProfile?.ageGroupsComfort)}
          />
        </FormField>
        <FormField
          id="vol-languages"
          label="Languages"
          hint="Spoken or teaching languages you can use with learners."
          className="mb-0"
        >
          <Textarea
            name="languages"
            required
            rows={2}
            className="min-h-[80px]"
            placeholder="e.g. English, Hindi"
            defaultValue={joinList(initialProfile?.languages)}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Logistics & availability"
        description="How you prefer to teach and when you are generally available."
      >
        <FormField
          id="vol-preferred-mode"
          label="Preferred teaching mode"
          hint="This helps NGOs and filters line up with how you want to work."
          className="mb-0"
        >
          <Select
            name="preferredMode"
            required
            defaultValue={initialProfile?.preferredMode ?? "HYBRID"}
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline (in person)</option>
            <option value="HYBRID">Hybrid</option>
          </Select>
        </FormField>
        <FormField
          id="vol-availability"
          label="Availability"
          hint="Typical days, times, time zones, or seasons—whatever helps NGOs plan with you."
          className="mb-0"
        >
          <Textarea
            name="availability"
            required
            rows={3}
            maxLength={4000}
            defaultValue={initialProfile?.availability ?? ""}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Experience & optional link"
        description="Prior teaching or volunteering experience is required; resume link is optional."
      >
        <FormField
          id="vol-prior"
          label="Prior teaching or volunteering experience"
          className="mb-0"
        >
          <Textarea
            name="priorExperience"
            required
            rows={4}
            maxLength={8000}
            defaultValue={initialProfile?.priorExperience ?? ""}
          />
        </FormField>
        <FormField
          id="vol-resume"
          label="Resume or portfolio URL"
          hint="Optional. Link to a PDF, personal site, or profile if you have one."
          className="mb-0"
        >
          <Input
            name="resumeUrl"
            type="url"
            maxLength={2000}
            placeholder="https://"
            defaultValue={initialProfile?.resumeUrl ?? ""}
            autoComplete="url"
          />
        </FormField>
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:rounded-xl sm:border sm:bg-surface sm:px-6 sm:py-5 sm:shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-sm text-muted-foreground">
            Saving returns you to your volunteer dashboard.
          </p>
          <Button type="submit" disabled={pending} loading={pending} className="w-full sm:w-auto">
            {pending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}
