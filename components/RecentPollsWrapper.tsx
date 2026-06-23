"use client";

import dynamic from "next/dynamic";

const RecentPollsHome = dynamic(() => import("./RecentPollsHome"), {
  ssr: false,
});

export default function RecentPollsWrapper() {
  return <RecentPollsHome />;
}
