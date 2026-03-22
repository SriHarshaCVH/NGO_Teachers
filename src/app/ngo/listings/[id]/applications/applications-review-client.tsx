"use client";

import type { NgoApplicationListItem } from "@/lib/ngo-application-review";
import type { PublicVolunteerProfileForNgoReview } from "@/lib/ngo-application-review";
import { ApplicationStatus } from "@prisma/client";
import { useCallback, useState } from "react";

type DetailJson = {
  application: {
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
    reviewedAt: string | null;
  };
  volunteerProfile: PublicVolunteerProfileForNgoReview | null;
};

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
          setError(data.error ?? "Could not load applicant details.");
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
        setError(data.message ?? data.error ?? "Could not update status.");
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
    <div>
      {error ? <p role="alert">{error}</p> : null}
      <p className="muted">Listing: {listingTitle}</p>
      {applications.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {applications.map((a) => (
            <li
              key={a.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: "0.75rem",
                padding: "0.75rem",
              }}
            >
              <div>
                <strong>{a.volunteer.fullName}</strong>
                {" — "}
                <span>{a.status}</span>
                {" — applied "}
                {new Date(a.appliedAt).toLocaleString()}
              </div>
              <p style={{ marginTop: "0.5rem" }}>
                <button type="button" onClick={() => toggleExpand(a.id)}>
                  {expandedId === a.id ? "Hide profile" : "View applicant profile"}
                </button>
              </p>
              {expandedId === a.id ? (
                <ApplicantProfilePanel
                  loading={loadingDetailId === a.id}
                  detail={detailCache[a.id]}
                />
              ) : null}
              <StatusActions
                status={a.status}
                disabled={updatingId === a.id}
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

function ApplicantProfilePanel(props: {
  loading: boolean;
  detail: DetailJson | undefined;
}) {
  const { loading, detail } = props;
  if (loading) {
    return <p>Loading profile…</p>;
  }
  if (!detail?.volunteerProfile) {
    return <p className="muted">No volunteer profile on file.</p>;
  }
  const v = detail.volunteerProfile;
  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "0.75rem",
        background: "#f6f6f6",
      }}
    >
      <p>{v.bio}</p>
      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem" }}>
        <dt>Location</dt>
        <dd>{v.location}</dd>
        <dt>Education</dt>
        <dd>{v.educationBackground}</dd>
        <dt>Subjects</dt>
        <dd>{formatJsonField(v.subjects)}</dd>
        <dt>Age groups</dt>
        <dd>{formatJsonField(v.ageGroupsComfort)}</dd>
        <dt>Languages</dt>
        <dd>{formatJsonField(v.languages)}</dd>
        <dt>Mode</dt>
        <dd>{v.preferredMode}</dd>
        <dt>Availability</dt>
        <dd>{v.availability}</dd>
        <dt>Experience</dt>
        <dd>{v.priorExperience}</dd>
        {v.resumeUrl ? (
          <>
            <dt>Resume</dt>
            <dd>
              <a href={v.resumeUrl} target="_blank" rel="noopener noreferrer">
                Link
              </a>
            </dd>
          </>
        ) : null}
      </dl>
    </div>
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
    return <p className="muted">Final decision recorded.</p>;
  }
  return (
    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {status === "PENDING" ? (
        <button type="button" disabled={disabled} onClick={onUnderReview}>
          Mark under review
        </button>
      ) : null}
      <button type="button" disabled={disabled} onClick={onAccept}>
        Accept
      </button>
      <button type="button" disabled={disabled} onClick={onReject}>
        Reject
      </button>
    </div>
  );
}
