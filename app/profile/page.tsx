import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { ProfileClient } from "@/components/course/profile-client";
import { ensureCourseUser } from "@/db/users";
import { isAdminEmail } from "@/lib/authz";
import { isAccessExpired } from "@/lib/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Личный кабинет" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ plan?: string; pay?: string }> }) {
  const params = await searchParams;
  const user = await requireChatGPTUser(`/profile${params.plan ? `?plan=${encodeURIComponent(params.plan)}&pay=${params.pay === "1" ? "1" : "0"}` : ""}`);
  const profile = await ensureCourseUser(user);

  return (
    <ProfileClient
      identity={{ displayName: user.displayName, email: user.email }}
      profile={profile}
      requestedPlan={params.plan ?? null}
      requestPayment={params.pay === "1"}
      signInPath={chatGPTSignInPath("/profile")}
      signOutPath={chatGPTSignOutPath("/")}
      isAdmin={isAdminEmail(user.email)}
      accessExpired={isAccessExpired(profile.accessExpiresAt)}
    />
  );
}
