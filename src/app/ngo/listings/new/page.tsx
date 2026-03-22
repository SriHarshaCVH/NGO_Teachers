import { FormPageLayout } from "@/components/layout/form-page-layout";
import { ListingForm } from "../listing-form";

export default function NewListingPage() {
  return (
    <FormPageLayout
      title="New listing"
      description="Describe the role, logistics, and deadline. Save as a draft while you work, or publish when every required field is ready."
      backHref="/ngo/listings"
      backLabel="Back to listings"
    >
      <ListingForm mode="create" />
    </FormPageLayout>
  );
}
