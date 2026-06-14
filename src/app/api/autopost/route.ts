import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Store auto-post settings in database
export async function GET() {
  try {
    // Get or create settings
    let settings = await prisma.settings.findFirst({
      where: { key: "autopost" },
    });
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          key: "autopost",
          value: JSON.stringify({
            enabled: false,
            schedule: "3x-daily", // 08:00, 13:00, 19:00
            postsPerRun: 3,
            maxPostsPerDay: 9,
            categories: ["Tech", "AI", "Programming", "Gadgets"],
            minArticleLength: 300,
            autoPublish: false,
            ollamaEnabled: false,
            imageSource: "unsplash",
            researchMode: true,
            logLevel: "info",
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
    const { 
      enabled, 
      schedule, 
      postsPerRun, 
      maxPostsPerDay,
      categories, 
      minArticleLength, 
      autoPublish, 
      ollamaEnabled, 
      imageSource,
      researchMode,
      logLevel,
    } = body;

    const settingsValue = JSON.stringify({
      enabled,
      schedule,
      postsPerRun,
      maxPostsPerDay,
      categories,
      minArticleLength,
      autoPublish,
      ollamaEnabled,
      imageSource,
      researchMode,
      logLevel,
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