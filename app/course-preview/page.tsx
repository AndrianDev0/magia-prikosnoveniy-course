import type { Metadata } from "next";
import { CoursePageClient } from "@/components/course/course-page-client";

export const metadata: Metadata = { title: "Демо курса" };

export default function CoursePreviewPage() {
  return <CoursePageClient header={{ user: null, signInPath: "/profile", signOutPath: "/", isAdmin: false }} />;
}
