"use client";
import SplashScreen from "../../page";

export default function AdminPreviewPage() {
  // This page allows admin to preview the site regardless of launch status
  return <SplashScreen ignoreLaunchLock={true} />;
}
