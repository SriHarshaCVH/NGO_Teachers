import { auth } from "@/auth";
import { matchLabelsForVolunteerSession } from "@/lib/discovery-match";
import { fetchOpenListingsForDiscovery } from "@/lib/listing-discovery";
import { toPublicListing } from "@/lib/listing";
import { discoveryQuerySchema } from "@/lib/validations/discovery";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Object.fromEntries(
    [...url.searchParams.entries()].filter(([, v]) => v !== "")
  );
  const parsed = discoveryQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const rows = await fetchOpenListingsForDiscovery(parsed.data);
  const session = await auth();
  const labels = await matchLabelsForVolunteerSession(session, rows);

  const listings = rows.map((row, i) => {
    const base = toPublicListing(row);
    const matchLabel = labels[i];
    if (matchLabel === null) {
      return base;
    }
    return { ...base, matchLabel };
  });

  return NextResponse.json({ listings });
}
