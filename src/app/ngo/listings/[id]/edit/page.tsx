import { auth } from "@/auth";
import { FormPageLayout } from "@/components/layout/form-page-layout";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { toPublicListing } from "@/lib/listing";
import { prisma } from "@/lib/prisma";
import { badgeVariantForListingStatus } from "@/lib/ui/status-badges";
import { notFound } from "next/navigation";
import { ListingForm } from "../../listing-form";

type Props = { params: Promise<{ id: string }> };

function statusLabel(
  status: "DRAFT" | "OPEN" | "CLOSED"
): string {
  switch (status) {
    case "DRAFT":
      return "Draft — not public";
    case "OPEN":
      return "Open — accepting applications";
    case "CLOSED":
      return "Closed — not accepting new applications";
    default:
      return status;
  }
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const row = await prisma.teachingNeed.findFirst({
    where: { id, ngoUserId: session!.user.id },
  });
  if (!row) notFound();

  const initial = toPublicListing(row);

  return (
    <FormPageLayout
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={badgeVariantForListingStatus(initial.status)}>
            {statusLabel(initial.status)}
          </Badge>
        </div>
      }
      title="Edit listing"
      description="Update details, save changes, or close the role when you are done recruiting. Publishing rules are unchanged."
      backHref="/ngo/listings"
      backLabel="Back to listings"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <ButtonLink
          href={`/ngo/listings/${id}/applications`}
          variant="outline"
          size="md"
          className="w-full sm:w-auto"
        >
          Review applications
        </ButtonLink>
      </div>
      <ListingForm mode="edit" initial={initial} />
    </FormPageLayout>
  );
}
