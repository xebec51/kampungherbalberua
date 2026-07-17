import { redirect } from "next/navigation";
import { getCurrentProfile, type CurrentProfile } from "@/lib/auth/get-current-profile";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isStaffRole, type StaffRole } from "@/lib/auth/permissions";
import { getSafeAdminRedirect } from "@/lib/auth/safe-redirect";
import type { User } from "@supabase/supabase-js";

export type StaffProfile = CurrentProfile & {
  role: StaffRole;
};

export type StaffSession = {
  profile: StaffProfile;
  user: User;
};

export async function requireStaff(nextPath = "/admin"): Promise<StaffSession> {
  const user = await getCurrentUser();

  if (!user) {
    const next = encodeURIComponent(getSafeAdminRedirect(nextPath));
    redirect(`/admin/login?next=${next}`);
  }

  const profile = await getCurrentProfile(user.id);

  if (!profile || !profile.is_active || !isStaffRole(profile.role)) {
    redirect("/admin/login?error=akses-ditolak");
  }

  return {
    profile: { ...profile, role: profile.role },
    user,
  };
}
