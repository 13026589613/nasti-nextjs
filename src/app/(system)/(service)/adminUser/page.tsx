"use client";

import PageContainer from "@/components/PageContainer";

import AdminUserIndex from "./components/adminUserIndex";

/**
 * @description UserCommunityRef List Manager Page
 * @returns
 */
export default function AdminUserPage() {
  return (
    <PageContainer className="min-w-[1200px]">
      <AdminUserIndex></AdminUserIndex>
    </PageContainer>
  );
}
