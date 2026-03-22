import { auth } from "@/auth";
import { matchLabelForVolunteerSession } from "@/lib/discovery-match";
import { fetchOpenListingById } from "@/lib/listing-discovery";
import { toPublicListing } from "@/lib/listing";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Public detail for a single OPEN listing. DRAFT/CLOSED return 404.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const row = await fetchOpenListingById(id);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  const listing = toPublicListing(row);
  const matchLabel = await matchLabelForVolunteerSession(session, row);

  return NextResponse.json({
    listing,
    matchLabel,
  });
}
