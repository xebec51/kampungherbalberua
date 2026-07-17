import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import type { StaffRole } from "@/lib/auth/permissions";

export async function requireRole(
  roles: readonly StaffRole[],
  nextPath = "/admin",
) {
  const session = await requireStaff(nextPath);

  if (!roles.includes(session.profile.role)) {
    redirect("/admin?error=akses-ditolak");
  }

  return session;
}
