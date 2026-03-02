import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Re-vision",
    short_name: "Re-vision",
    description:
      "AI-powered quiz generator — transform your notes, PDFs, and YouTube videos into interactive quizzes instantly.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Create Quiz",
        short_name: "New Quiz",
        description: "Start creating a new quiz from your notes",
        url: "/dashboard/create",
      },
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "View all your quizzes",
        url: "/dashboard",
      },
    ],
  };
}
