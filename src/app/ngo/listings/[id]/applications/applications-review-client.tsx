"use client";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { NgoApplicationListItem } from "@/lib/ngo-application-review";
import type { PublicVolunteerProfileForNgoReview } from "@/lib/ngo-application-review";
import { cn } from "@/lib/cn";
import {
  badgeVariantForApplicationStatus,
  labelForApplicationStatus,
} from "@/lib/ui/status-badges";
import { ApplicationStatus } from "@prisma/client";
import { useCallback, useId, useState } from "react";

type DetailJson = {
  application: {
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
    reviewedAt: string | null;
  };
  volunteerProfile: PublicVolunteerProfileForNgoReview | null;
};

function isTerminalStatus(status: ApplicationStatus): boolean {
  return status === "ACCEPTED" || status === "REJECTED";
}

export function ApplicationsReviewClient(props: {
  listingId: string;
  listingTitle: string;
  initialApplications: NgoApplicationListItem[];
}) {
  const { listingId, listingTitle, initialApplications } = props;
  const [applications, setApplications] = useState(initialApplications);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, DetailJson>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const basePath = `/api/ngo/listings/${listingId}/applications`;

  const loadDetail = useCallback(
    async (applicationId: string) => {
      if (detailCache[applicationId]) return;
      setLoadingDetailId(applicationId);
      setError(null);
      try {
        const res = await fetch(`${basePath}/${applicationId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(
            (typeof data.message === "string" && data.message) ||
              (typeof data.error === "string" && data.error) ||
              "Could not load applicant details."
          );
          return;
        }
        setDetailCache((prev) => ({ ...prev, [applicationId]: data as DetailJson }));
      } finally {
        setLoadingDetailId(null);
      }
    },
    [basePath, detailCache]
  );

  const toggleExpand = async (applicationId: string) => {
    if (expandedId === applicationId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(applicationId);
    await loadDetail(applicationId);
  };

  const patchStatus = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    setUpdatingId(applicationId);
    setError(null);
    try {
      const res = await fetch(`${basePath}/${applicationId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (typeof data.message === "string" && data.message) ||
            (typeof data.error === "string" && data.error) ||
            "Could not update status."
        );
        return;
      }
      const detail = data as DetailJson;
      setDetailCache((prev) => ({ ...prev, [applicationId]: detail }));
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: detail.application.status } : a
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <Alert variant="error" role="alert" aria-live="assertive">
          {error}
        </Alert>
      ) : null}

      <SectionHeader
        title="Applicants"
        description={`Volunteers who applied to “${listingTitle}”. Expand a row to read their full profile before recording a decision.`}
      />

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="When volunteers apply to this listing, they will appear here for review."
        />
      ) : (
        <ul className="list-none space-y-4 p-0">
          {applications.map((a) => (
            <li key={a.id}>
              <ApplicantReviewCard
                application={a}
                expanded={expandedId === a.id}
                onToggleExpand={() => toggleExpand(a.id)}
                detail={detailCache[a.id]}
                loadingDetail={loadingDetailId === a.id}
                updating={updatingId === a.id}
                onUnderReview={() =>
                  patchStatus(a.id, ApplicationStatus.UNDER_REVIEW)
                }
                onAccept={() => patchStatus(a.id, ApplicationStatus.ACCEPTED)}
                onReject={() => patchStatus(a.id, ApplicationStatus.REJECTED)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ApplicantReviewCard(props: {
  application: NgoApplicationListItem;
  expanded: boolean;
  onToggleExpand: () => void;
  detail: DetailJson | undefined;
  loadingDetail: boolean;
  updating: boolean;
  onUnderReview: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const {
    application: a,
    expanded,
    onToggleExpand,
    detail,
    loadingDetail,
    updating,
    onUnderReview,
    onAccept,
    onReject,
  } = props;
  const panelId = useId();
  const terminal = isTerminalStatus(a.status);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors",
        a.status === "ACCEPTED" && "border-success/35 bg-success/[0.06]",
        a.status === "REJECTED" && "border-destructive/35 bg-destructive/[0.04]"
      )}
    >
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold leading-snug">
                {a.volunteer.fullName}
              </CardTitle>
              <Badge variant={badgeVariantForApplicationStatus(a.status)}>
                {labelForApplicationStatus(a.status)}
              </Badge>
              {terminal ? (
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Final
                </span>
              ) : (
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Action needed
                </span>
              )}
            </div>
            <CardDescription className="text-sm">
              Applied{" "}
              {new Date(a.appliedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={onToggleExpand}
          >
            {expanded ? "Hide profile details" : "View applicant profile"}
          </Button>
        </div>
      </CardHeader>

      {expanded ? (
        <CardContent className="border-t border-border">
          <div id={panelId}>
            <ApplicantProfilePanel loading={loadingDetail} detail={detail} />
          </div>
        </CardContent>
      ) : null}

      <CardContent className="border-t border-border pt-4">
        <StatusActions
          status={a.status}
          disabled={updating}
          onUnderReview={onUnderReview}
          onAccept={onAccept}
          onReject={onReject}
        />
      </CardContent>
    </Card>
  );
}

function ApplicantProfilePanel(props: {
  loading: boolean;
  detail: DetailJson | undefined;
}) {
  const { loading, detail } = props;
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Loading profile…
      </p>
    );
  }
  if (!detail?.volunteerProfile) {
    return (
      <p className="text-sm text-muted-foreground">No volunteer profile on file.</p>
    );
  }
  const v = detail.volunteerProfile;
  return (
    <div className="space-y-4 rounded-lg border border-border/80 bg-muted/25 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Profile summary</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {v.bio}
        </p>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-x-4">
        <DetailRow label="Location" value={v.location} />
        <DetailRow label="Education" value={v.educationBackground} />
        <DetailRow label="Subjects" value={formatJsonField(v.subjects)} />
        <DetailRow label="Age groups" value={formatJsonField(v.ageGroupsComfort)} />
        <DetailRow label="Languages" value={formatJsonField(v.languages)} />
        <DetailRow label="Mode" value={v.preferredMode} />
        <DetailRow label="Availability" value={v.availability} />
        <DetailRow label="Experience" value={v.priorExperience} />
        {v.resumeUrl ? (
          <>
            <dt className="font-medium text-muted-foreground">Resume</dt>
            <dd className="min-w-0">
              <a
                href={v.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Open resume link
              </a>
            </dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-foreground">{value}</dd>
    </>
  );
}

function formatJsonField(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function StatusActions(props: {
  status: ApplicationStatus;
  disabled: boolean;
  onUnderReview: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { status, disabled, onUnderReview, onAccept, onReject } = props;
  if (status === "ACCEPTED" || status === "REJECTED") {
    return (
      <p className="m-0 text-sm text-muted-foreground" role="status">
        Final decision recorded — no further status changes are available for this
        application.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="m-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Update status
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {status === "PENDING" ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={onUnderReview}
            className="w-full sm:w-auto"
          >
            Mark under review
          </Button>
        ) : null}
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={disabled}
          onClick={onAccept}
          className="w-full sm:w-auto"
        >
          Accept
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={disabled}
          onClick={onReject}
          className="w-full sm:w-auto"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
