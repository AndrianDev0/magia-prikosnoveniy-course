import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { HomeClient } from "@/components/course/home-client";
import { isAdminEmail } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getChatGPTUser();
  return (
    <HomeClient
      user={user ? { displayName: user.displayName } : null}
      signInPath={chatGPTSignInPath("/profile")}
      signOutPath={chatGPTSignOutPath("/")}
      isAdmin={user ? isAdminEmail(user.email) : false}
      planPaths={{
        standard: user ? "/profile?plan=standard&pay=1" : chatGPTSignInPath("/profile?plan=standard&pay=1"),
        vip: user ? "/profile?plan=vip&pay=1" : chatGPTSignInPath("/profile?plan=vip&pay=1"),
        "vip-plus": user ? "/profile?plan=vip-plus&pay=1" : chatGPTSignInPath("/profile?plan=vip-plus&pay=1"),
      }}
    />
  );
}
