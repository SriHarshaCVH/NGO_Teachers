"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    <form onSubmit={onSubmit} className="space-y-8">
      {error ? (
        <Alert variant="error" title="Could not save profile">
          <p className="m-0">{error}</p>
        </Alert>
      ) : null}

      <FormSection
        title="Organization details"
        description="How your NGO appears to volunteers and on listings. Everything here is required except where noted."
      >
        <FormField
          id="ngo-name"
          label="Organization name"
          className="mb-0"
        >
          <Input
            name="name"
            type="text"
            required
            maxLength={500}
            defaultValue={initialProfile?.name ?? ""}
            autoComplete="organization"
          />
        </FormField>
        <FormField
          id="ngo-description"
          label="Mission and description"
          hint="A short overview of your work and who you serve."
          className="mb-0"
        >
          <Textarea
            name="description"
            required
            rows={5}
            maxLength={8000}
            defaultValue={initialProfile?.description ?? ""}
          />
        </FormField>
        <FormField
          id="ngo-location"
          label="Primary location"
          hint="City, region, or country—whatever you use in listings."
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
          id="ngo-age-groups"
          label="Age groups served"
          hint='Enter one or more bands, separated by commas (e.g. "6-10, 11-14, 15-18"). Each segment becomes its own tag for matching—spaces around commas are fine.'
          className="mb-0"
        >
          <Textarea
            name="ageGroupsServed"
            required
            rows={2}
            className="min-h-[80px]"
            placeholder="e.g. 6-10, 11-14, 15-18"
            defaultValue={ageGroupsDefault}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Primary contact"
        description="We use this to reach your organization about applications and listings."
      >
        <FormField
          id="ngo-contact-name"
          label="Contact person name"
          className="mb-0"
        >
          <Input
            name="contactPersonName"
            type="text"
            required
            maxLength={200}
            defaultValue={initialProfile?.contactPersonName ?? ""}
            autoComplete="name"
          />
        </FormField>
        <FormField
          id="ngo-contact-email"
          label="Contact email"
          className="mb-0"
        >
          <Input
            name="contactEmail"
            type="email"
            required
            maxLength={320}
            defaultValue={initialProfile?.contactEmail ?? ""}
            autoComplete="email"
          />
        </FormField>
        <FormField
          id="ngo-contact-phone"
          label="Contact phone"
          className="mb-0"
        >
          <Input
            name="contactPhone"
            type="tel"
            required
            maxLength={40}
            defaultValue={initialProfile?.contactPhone ?? ""}
            autoComplete="tel"
          />
        </FormField>
        <FormField
          id="ngo-website"
          label="Website or social link"
          hint="Optional. Link to your site or a public social profile."
          className="mb-0"
        >
          <Input
            name="websiteOrSocial"
            type="text"
            maxLength={2000}
            defaultValue={initialProfile?.websiteOrSocial ?? ""}
            autoComplete="url"
          />
        </FormField>
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:rounded-xl sm:border sm:bg-surface sm:px-6 sm:py-5 sm:shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-sm text-muted-foreground">
            Saving returns you to your NGO dashboard.
          </p>
          <Button type="submit" disabled={pending} loading={pending} className="w-full sm:w-auto">
            {pending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}
