import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch Poll
    const { data: poll } = await supabase
      .from("polls")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!poll) {
      return new Response("Poll not found", { status: 404 });
    }

    // 2. Fetch Options
    const { data: options } = await supabase
      .from("poll_options")
      .select("label")
      .eq("poll_id", poll.id)
      .order("position", { ascending: true });

    // 3. Count votes
    const { count } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("poll_id", poll.id);

    const voteCount = count || 0;
    const question = poll.question || "Ranked Poll";
    const description = (poll.settings as any)?.description || "";

    // Resolve theme colors
    const theme = (poll.settings as any)?.theme || "indigo";
    let primaryColor = "#4f46e5";
    let secondaryColor = "#f43f5e";

    if (theme.startsWith("#")) {
      if (theme.includes("_")) {
        const parts = theme.split("_");
        primaryColor = parts[0];
        secondaryColor = parts[1];
      } else {
        primaryColor = theme;
        secondaryColor = "#ec4899"; // default custom secondary
      }
    } else {
      const presets: Record<string, { primary: string; secondary: string }> = {
        indigo: { primary: "#4f46e5", secondary: "#f43f5e" },
        emerald: { primary: "#059669", secondary: "#10b981" },
        rose: { primary: "#e11d48", secondary: "#fb7185" },
        amber: { primary: "#d97706", secondary: "#fbbf24" },
        violet: { primary: "#7c3aed", secondary: "#a78bfa" },
      };
      const preset = presets[theme] || presets.indigo;
      primaryColor = preset.primary;
      secondaryColor = preset.secondary;
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
            padding: "80px",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          {/* Logo Watermark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: secondaryColor,
            }}
          >
            📊 Ranked Poll
          </div>

          {/* Main Content Layout */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left Column: Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "60%",
              }}
            >
              <div
                style={{
                  fontSize: "52px",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: "20px",
                  wordBreak: "break-word",
                }}
              >
                {question}
              </div>
              {description && (
                <div
                  style={{
                    fontSize: "22px",
                    color: "#cbd5e1",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {description}
                </div>
              )}
            </div>

            {/* Right Column: Choices Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "24px",
                padding: "32px",
                minWidth: "360px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  letterSpacing: "0.1em",
                  marginBottom: "20px",
                }}
              >
                Options List
              </div>
              {options?.slice(0, 4).map((opt: any, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "20px",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: secondaryColor,
                      marginRight: "16px",
                    }}
                  />
                  {opt.label}
                </div>
              ))}
              {options && options.length > 4 && (
                <div
                  style={{
                    fontSize: "18px",
                    color: "#94a3b8",
                    marginTop: "6px",
                    marginLeft: "26px",
                  }}
                >
                  + {options.length - 4} more options
                </div>
              )}
            </div>
          </div>

          {/* Metadata Footer */}
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "18px",
              color: "#94a3b8",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
            }}
          >
            <div>
              {voteCount} {voteCount === 1 ? "ballot" : "ballots"} cast
            </div>
            <div style={{ color: secondaryColor, fontWeight: 800, display: "flex", alignItems: "center" }}>
              Cast Your Vote &rarr;
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
