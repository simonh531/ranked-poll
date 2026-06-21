import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rankedpoll.com";

  // Static routes
  const routes = [
    "",
    "/about",
    "/about/calculation",
    "/login",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const supabase = await createClient();
    
    // Fetch all poll slugs to index them in the sitemap
    const { data: polls } = await supabase
      .from("polls")
      .select("slug, created_at")
      .order("created_at", { ascending: false })
      .limit(1000); // Guard limit to prevent memory issues

    if (polls) {
      const pollRoutes = polls.map((poll) => ({
        url: `${baseUrl}/polls/${poll.slug}`,
        lastModified: new Date(poll.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
      return [...routes, ...pollRoutes];
    }
  } catch (error) {
    console.error("Failed to generate dynamic sitemap routes:", error);
  }

  return routes;
}
