import { redirect } from "next/navigation";
import { getCurrentRole } from "@/lib/auth";
import { AdvisorApp } from "./AdvisorApp";

export const metadata = {
  title: "לוח היועץ | ארתור",
};

export default async function AdvisorPage() {
  const role = await getCurrentRole();
  if (role.kind !== "advisor") redirect("/login");
  return <AdvisorApp advisorId={role.advisorId} advisorName={role.name} />;
}
