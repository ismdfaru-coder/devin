export interface FeedConfig {
  name: string;
  url: string;
  category: string;
  type: "news" | "reviews" | "dev" | "blog" | "enterprise" | "ai" | "social";
}

export const TECH_FEEDS: FeedConfig[] = [
  // ============================================
  // MAJOR TECH NEWS & MEDIA (Top Authority)
  // ============================================
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "Tech", type: "news" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "Tech", type: "news" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", category: "Tech", type: "news" },
  { name: "Engadget", url: "https://www.engadget.com/rss.xml", category: "Gadgets", type: "news" },
  { name: "Mashable", url: "https://mashable.com/feeds/rss", category: "Tech", type: "news" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", category: "Tech", type: "news" },
  
  // ============================================
  // SEO / PRODUCT REVIEW GIANTS (Highest Traffic)
  // ============================================
  { name: "CNET", url: "https://www.cnet.com/rss/news/", category: "Tech", type: "reviews" },
  { name: "TechRadar", url: "https://www.techradar.com/rss", category: "Gadgets", type: "reviews" },
  { name: "Tom's Guide", url: "https://www.tomsguide.com/feed", category: "Tech", type: "reviews" },
  { name: "PCMag", url: "https://feeds.pcmag.com/rss/news.aspx", category: "Tech", type: "reviews" },
  { name: "Digital Trends", url: "https://www.digitaltrends.com/feed/", category: "Gadgets", type: "reviews" },
  { name: "Lifewire", url: "https://www.lifewire.com/feed", category: "Tech", type: "reviews" },
  { name: "MakeUseOf", url: "https://www.makeuseof.com/feed/", category: "Tech", type: "reviews" },
  
  // ============================================
  // ENTERPRISE + B2B + WIRE SERVICES
  // ============================================
  { name: "ZDNet", url: "https://www.zdnet.com/news/rss.xml", category: "Tech", type: "enterprise" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", category: "AI", type: "enterprise" },
  { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews", category: "Cybersecurity", type: "news" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", category: "Cybersecurity", type: "news" },
  
  // ============================================
  // DEVELOPER + AI ECOSYSTEM (High Influence)
  // ============================================
  { name: "Dev.to", url: "https://dev.to/feed", category: "Programming", type: "dev" },
  { name: "Hacker Noon", url: "https://hackernoon.com/feed", category: "Tech", type: "dev" },
  { name: "Towards Data Science", url: "https://towardsdatascience.com/feed", category: "AI", type: "ai" },
  { name: "Analytics Vidhya", url: "https://www.analyticsvidhya.com/blog/feed/", category: "AI", type: "ai" },
  { name: "GitHub Blog", url: "https://github.blog/feed/", category: "Programming", type: "dev" },
  { name: "Stack Overflow Blog", url: "https://stackoverflow.blog/feed/", category: "Programming", type: "dev" },
  { name: "AI News", url: "https://www.artificialintelligence-news.com/feed/", category: "AI", type: "ai" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/ai/feed/", category: "AI", type: "ai" },
  
  // ============================================
  // MOBILE ECOSYSTEM
  // ============================================
  { name: "Android Authority", url: "https://www.androidauthority.com/feed/", category: "Gadgets", type: "reviews" },
  { name: "9to5Mac", url: "https://9to5mac.com/feed/", category: "Gadgets", type: "news" },
  { name: "Windows Central", url: "https://www.windowscentral.com/rss", category: "Software", type: "news" },
  { name: "MacRumors", url: "https://feeds.macrumors.com/MacRumors-All", category: "Gadgets", type: "news" },
  
  // ============================================
  // SOCIAL / TRENDING (Reddit, HN style)
  // ============================================
  { name: "Reddit r/technology", url: "https://www.reddit.com/r/technology/.rss", category: "Tech", type: "social" },
  { name: "Reddit r/programming", url: "https://www.reddit.com/r/programming/.rss", category: "Programming", type: "social" },
  { name: "Reddit r/artificial", url: "https://www.reddit.com/r/artificial/.rss", category: "AI", type: "social" },
  
  // ============================================
  // SCIENCE & STARTUPS
  // ============================================
  { name: "New Scientist", url: "https://www.newscientist.com/feed/", category: "Science", type: "news" },
  { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", category: "Startups", type: "news" },
  { name: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml", category: "Science", type: "news" },
  
  // ============================================
  // BLOGS & NEWSLETTERS
  // ============================================
  { name: "Medium Top Tech", url: "https://medium.com/feed/tag/technology", category: "Tech", type: "blog" },
  { name: "Bleeping Computer", url: "https://www.bleepingcomputer.com/feed/", category: "Cybersecurity", type: "news" },
  { name: "Social Media Today", url: "https://www.socialmediatoday.com/rss.xml", category: "Tech", type: "news" },
  { name: "Search Engine Land", url: "https://searchengineland.com/feed", category: "Tech", type: "news" },
];

// Category mapping for auto-categorization
export const CATEGORY_MAP: Record<string, string> = {
  tech: "Tech",
  ai: "AI",
  programming: "Programming",
  gadgets: "Gadgets",
  cybersecurity: "Cybersecurity",
  startups: "Startups",
  science: "Science",
  software: "Software",
  reviews: "Best Picks",
  news: "Tech",
  dev: "Programming",
  blog: "Tech",
  enterprise: "Tech",
  social: "Tech",
};

// Default categories for new posts
export const DEFAULT_CATEGORIES = [
  { slug: "tech", label: "Tech", icon: "💻" },
  { slug: "ai", label: "AI", icon: "🤖" },
  { slug: "programming", label: "Programming", icon: "💻" },
  { slug: "gadgets", label: "Gadgets", icon: "📱" },
  { slug: "cybersecurity", label: "Cybersecurity", icon: "🔒" },
  { slug: "startups", label: "Startups", icon: "🚀" },
  { slug: "science", label: "Science", icon: "🔬" },
  { slug: "software", label: "Software", icon: "⚙️" },
  { slug: "best-picks", label: "Best Picks", icon: "⭐" },
];

export function getFeedsByType(type: string): FeedConfig[] {
  return TECH_FEEDS.filter(f => f.type === type);
}

export function getFeedsByCategory(category: string): FeedConfig[] {
  return TECH_FEEDS.filter(f => f.category.toLowerCase() === category.toLowerCase());
}

// Get category from topic keywords
export function detectCategory(title: string, content: string): string {
  const text = (title + " " + content).toLowerCase();
  
  if (text.match(/\b(ai|artificial intelligence|chatgpt|gpt|llm|machine learning|neural|deep learning)\b/)) {
    return "AI";
  }
  if (text.match(/\b(programming|coding|developer|javascript|python|software|api|github)\b/)) {
    return "Programming";
  }
  if (text.match(/\b(phone|mobile|iphone|android|tablet|gadget|apple|samsung|google pixel)\b/)) {
    return "Gadgets";
  }
  if (text.match(/\b(security|hack|breach|cyber|vulnerability|malware|ransomware)\b/)) {
    return "Cybersecurity";
  }
  if (text.match(/\b(startup|funding|venture|ipo|acquisition|merge)\b/)) {
    return "Startups";
  }
  if (text.match(/\b(science|research|nasa|space|physics|biology|climate)\b/)) {
    return "Science";
  }
  if (text.match(/\b(update|release|version|launch|microsoft|windows|linux|macos)\b/)) {
    return "Software";
  }
  
  return "Tech";
}