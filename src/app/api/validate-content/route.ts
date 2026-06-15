import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/categories";

interface ValidationResult {
  type: "post" | "category";
  id: string;
  title: string;
  issue: string;
  action: "remove" | "update" | "keep";
  newCategory?: string;
  confidence: number;
}

// Keyword mapping for category relevance
const categoryKeywords: Record<string, string[]> = {
  tech: ["technology", "tech", "innovation", "digital", "device", "gadget", "computer", "software", "hardware", "app", "application", "system", "platform", "cloud", "data", "network", "internet", "web", "online"],
  ai: ["artificial intelligence", "ai", "machine learning", "ml", "deep learning", "neural network", "gpt", "llm", "chatbot", "automation", "robot", "cognitive", "nlp", "openai", "anthropic", "gemini", "claude", "copilot", "generative"],
  programming: ["programming", "code", "coding", "developer", "development", "javascript", "python", "java", "react", "node", "api", "function", "algorithm", "debug", "software engineering", "frontend", "backend", "database", "sql", "typescript"],
  gadgets: ["gadget", "smartphone", "phone", "tablet", "laptop", "watch", "earbuds", "headphones", "camera", "drone", "speaker", "smart home", "fitness tracker", "vr", "ar", "wearable", "apple", "samsung", "google pixel"],
  cybersecurity: ["security", "hack", "breach", "cyber", "malware", "virus", "phishing", "privacy", "encryption", "vulnerability", "exploit", "firewall", "password", "authentication", "2fa", "mfa", "ransomware", "spyware", "threat", "attack"],
  startups: ["startup", "founder", "venture", "vc", "funding", "investment", "pitch", "unicorn", "seed", "series", "accelerator", "incubator", "entrepreneur", "business", "launch", "product", "market", "revenue", "growth"],
  science: ["science", "research", "study", "discovery", "experiment", "scientist", "physics", "chemistry", "biology", "astronomy", "space", "nasa", "mars", "climate", "environment", "medical", "health research", "genetics", "dna"],
  software: ["software", "app", "application", "saas", "tool", "platform", "cloud", "opensource", "github", "version", "update", "release", "feature", "bug", "patch", "framework", "library", "package"],
  "best-picks": ["best", "top", "review", "recommendation", "comparison", "vs", "versus", "ranked", "rating", "score", "winner", "choice", "selection", "featured", "favorite", "recommended"],
  health: ["health", "wellness", "fitness", "exercise", "diet", "nutrition", "medical", "medicine", "doctor", "hospital", "treatment", "disease", "symptom", "prevention", "mental health", "sleep", "stress"],
  "home-garden": ["home", "garden", "house", "kitchen", "living room", "bedroom", "decoration", "furniture", "interior", "landscape", "plant", "flower", "outdoor", "backyard", "patio", "lawn"],
  comparisons: ["comparison", "vs", "versus", "difference", "compare", "better", "worse", "pros", "cons", "feature", "spec", "specification", "benchmark", "test"],
  hacks: ["hack", "tips", "tricks", "tips and tricks", "life hack", "shortcut", "workaround", "trick", "secret", "hidden feature", "optimize", "boost", "speed up"],
  competitors: ["competitor", "competition", "rival", "alternative", "vs", "market share", "industry", "competitor analysis", "disruption", "market"],
};

function analyzeContentRelevance(
  title: string,
  content: string,
  category: string
): { score: number; issues: string[] } {
  const text = `${title} ${content}`.toLowerCase();
  const keywords = categoryKeywords[category] || [];
  
  let matches = 0;
  const issues: string[] = [];
  
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      matches++;
    }
  }
  
  // Calculate relevance score (0-100)
  const score = Math.min(100, (matches / Math.max(keywords.length * 0.1, 1)) * 100);
  
  // Check for issues
  if (matches === 0) {
    issues.push(`Content does not contain any keywords related to "${category}" category`);
  } else if (matches < 3) {
    issues.push(`Content has very weak relevance to "${category}" category (only ${matches} keyword matches)`);
  }
  
  // Check for fake/spam indicators
  const spamIndicators = [
    /buy now/i,
    /click here/i,
    /limited time/i,
    /act now/i,
    /free money/i,
    /make \$\d+/i,
    /guaranteed/i,
    /no experience/i,
    /work from home scam/i,
  ];
  
  for (const pattern of spamIndicators) {
    if (pattern.test(text)) {
      issues.push("Content contains spam-like language");
    }
  }
  
  // Check content length
  if (content.length < 100) {
    issues.push("Content is too short (less than 100 characters)");
  }
  
  // Check for gibberish/random text
  const gibberishPatterns = [
    /^[a-z]+\s[a-z]+\s[a-z]+$/i,
    /(.)\1{4,}/, // repeated characters
    /lorum ipsum/i,
  ];
  
  for (const pattern of gibberishPatterns) {
    if (pattern.test(text)) {
      issues.push("Content appears to be gibberish or placeholder text");
    }
  }
  
  return { score, issues };
}

function findBestCategory(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  let bestCategory = "tech"; // default
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }
    if (matches > bestScore) {
      bestScore = matches;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    
    // Fetch all published posts
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
    
    const results: ValidationResult[] = [];
    const postsToUpdate: { id: string; category: string }[] = [];
    const postsToUnpublish: string[] = [];
    
    // Analyze each post
    for (const post of posts) {
      const analysis = analyzeContentRelevance(
        post.title,
        post.content,
        post.category || "tech"
      );
      
      let suggestedAction: "remove" | "update" | "keep" = "keep";
      let suggestedCategory = post.category || undefined;
      
      // Decision logic
      if (analysis.issues.includes("Content appears to be gibberish or placeholder text") ||
          analysis.issues.includes("Content is too short (less than 100 characters)")) {
        suggestedAction = "remove";
      } else if (analysis.score < 30) {
        // Low relevance - try to find a better category
        const bestCategory = findBestCategory(post.title, post.content);
        if (bestCategory !== post.category) {
          suggestedAction = "update";
          suggestedCategory = bestCategory;
        } else {
          suggestedAction = "remove"; // Can't fix, remove it
        }
      } else if (analysis.score < 50) {
        suggestedAction = "update";
        suggestedCategory = findBestCategory(post.title, post.content);
      }
      
      // Check for spam
      if (analysis.issues.includes("Content contains spam-like language")) {
        suggestedAction = "remove";
      }
      
      const result: ValidationResult = {
        type: "post",
        id: post.id,
        title: post.title,
        issue: analysis.issues.join("; ") || "No issues found",
        action: suggestedAction,
        newCategory: suggestedCategory,
        confidence: analysis.score,
      };
      
      results.push(result);
      
      // Track changes
      if (suggestedAction === "remove") {
        postsToUnpublish.push(post.id);
      } else if (suggestedAction === "update" && suggestedCategory !== post.category) {
        postsToUnpublish.push(post.id); // We'll mark as unpublished until manually reviewed
      }
    }
    
    // Analyze categories
    const usedCategories = new Set(posts.map((p) => p.category).filter(Boolean));
    for (const cat of categories) {
      const postsInCategory = posts.filter((p) => p.category === cat.slug);
      
      if (postsInCategory.length === 0 && action === "cleanup") {
        results.push({
          type: "category",
          id: cat.slug,
          title: cat.label,
          issue: "No posts in this category",
          action: "remove",
          confidence: 100,
        });
      }
    }
    
    // Execute actions if requested
    if (action === "auto" || action === "cleanup") {
      // Unpublish problematic posts (they need manual review)
      if (postsToUnpublish.length > 0) {
        await prisma.post.updateMany({
          where: { id: { in: postsToUnpublish } },
          data: { published: false },
        });
      }
    }
    
    const stats = {
      totalPosts: posts.length,
      keep: results.filter((r) => r.action === "keep").length,
      update: results.filter((r) => r.action === "update").length,
      remove: results.filter((r) => r.action === "remove").length,
      unpublished: postsToUnpublish.length,
    };
    
    return NextResponse.json({
      success: true,
      results,
      stats,
      message: `Validated ${posts.length} posts. ${stats.keep} OK, ${stats.remove} flagged for review, ${stats.update} suggested category changes.`,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { success: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return validation criteria info
    return NextResponse.json({
      criteria: {
        relevance: "Content must match category keywords",
        spamCheck: "No spam-like language allowed",
        minLength: "Minimum 100 characters",
        authenticity: "No gibberish or placeholder text",
      },
      categories: Object.keys(categoryKeywords),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch criteria" },
      { status: 500 }
    );
  }
}