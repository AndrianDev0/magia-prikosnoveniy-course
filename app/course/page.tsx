import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { CoursePageClient } from "@/components/course/course-page-client";
import { AccessGate } from "@/components/course/access-gate";
import { ensureCourseUser } from "@/db/users";
import { isAdminEmail } from "@/lib/authz";
import { isAccessExpired } from "@/lib/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Курс" };

export default async function CoursePage() {
  const identity = await requireChatGPTUser("/course");
  const profile = await ensureCourseUser(identity);
  const expired = isAccessExpired(profile.accessExpiresAt);
  const header = {
    user: { displayName: identity.displayName },
    signInPath: chatGPTSignInPath("/course"),
    signOutPath: chatGPTSignOutPath("/"),
    isAdmin: isAdminEmail(identity.email),
  };
  if (!profile.accessGranted || expired) {
    return <AccessGate header={header} paymentStatus={profile.paymentStatus} expired={expired} />;
  }
  return <CoursePageClient header={header} />;
}
