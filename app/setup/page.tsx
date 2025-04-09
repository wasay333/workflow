import { SetupUser } from "@/actions/billings/SetupUser";
import { waitFor } from "@/lib/waitFor";

export default async function SetupPage() {
  await waitFor(5000);
  return await SetupUser();
}
