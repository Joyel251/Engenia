"use client";
import SplashScreen from "../../page";

export default function AdminPreviewPage() {
  // This page allows admin to preview the site regardless of launch status
  // SplashScreen will detect this route and bypass the launch lock automatically.
  return <SplashScreen params={{}} searchParams={{}} />;
}
