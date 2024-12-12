"use client";
import { createEmbeddingContext } from "amazon-quicksight-embedding-sdk";
import { useEffect, useRef } from "react";

import { getReportsUrl } from "@/api/reports";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";

export default function Reports() {
  const containerRef = useRef<HTMLDivElement>(null);

  const embedDashboardRef = useRef<any>(null);

  const { communityId } = useGlobalCommunityId();
  const init = async (embedUrl: string) => {
    const embeddingContext = await createEmbeddingContext();

    const { embedDashboard } = embeddingContext;

    return await embedDashboard(
      {
        url: embedUrl,
        container: containerRef.current as HTMLDivElement,
      },
      {
        parameters: [
          {
            Name: "communityId",
            Values: [communityId],
          },
        ],
      }
    );
  };

  const getUrl = async () => {
    const res = await getReportsUrl();
    if (res.code === 200) {
      embedDashboardRef.current = await init(res.data);
    }
  };
  useEffect(() => {
    if (containerRef.current) {
      getUrl();
    }
  }, [containerRef]);

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}></div>
    </>
  );
}
