import React from "react";
import AboutSidebar from "./AboutSidebar";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Shared Navigation Sidebar */}
        <aside className="md:col-span-1 space-y-2">
          <AboutSidebar />
        </aside>

        {/* Dynamic Page Content */}
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
