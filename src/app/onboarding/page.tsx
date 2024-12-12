"use client";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  router.replace("/onboarding/index");
  return <></>;
}
