import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Store auto-post settings in database
export async function GET() {
  try {
    // Get or create settings
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          key: "autopost",
          value: JSON.stringify({
            enabled: false,
            schedule: "0 8 * * *", // Daily at 8 AM
            postsPerDay: 3,
            categories: ["Tech", "AI", "Best Picks"],
            minArticleLength: 300,
            autoPublish: false,
            ollamaEnabled: false,
            imageSource: "pixabay", // pixabay, unsplash, pexels
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: JSON.parse(settings.value),
    });
  } catch (error) {
    console.error("Error fetching autopost settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enabled, schedule, postsPerDay, categories, minArticleLength, autoPublish, ollamaEnabled, imageSource } = body;

    const settingsValue = JSON.stringify({
      enabled,
      schedule,
      postsPerDay,
      categories,
      minArticleLength,
      autoPublish,
      ollamaEnabled,
      imageSource,
    });

    // Upsert settings
    await prisma.settings.upsert({
      where: { key: "autopost" },
      update: { value: settingsValue },
      create: { key: "autopost", value: settingsValue },
    });

    return NextResponse.json({
      success: true,
      message: "Auto-post settings updated",
    });
  } catch (error) {
    console.error("Error saving autopost settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}