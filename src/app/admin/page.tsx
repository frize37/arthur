import { redirect } from "next/navigation";
import { getCurrentRole } from "@/lib/auth";
import { AdminApp } from "./AdminApp";

export const metadata = {
  title: "קונסולת ניהול | ארתור",
};

export default async function AdminPage() {
  const role = await getCurrentRole();
  if (role.kind !== "admin") redirect("/login");
  return <AdminApp adminId={role.adminId} adminName={role.name} adminRole={role.adminRole} />;
}
