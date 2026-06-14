export interface FeedConfig {
  name: string;
  url: string;
  category: string;
  type: "news" | "reviews" | "dev" | "blog" | "enterprise" | "ai";
  priority: "high" | "medium" | "low";
}

export const TECH_FEEDS: FeedConfig[] = [
  // ============================================
  // MAJOR TECH NEWS & MEDIA (Top Authority)
  // ============================================
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "Tech", type: "news", priority: "high" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "Tech", type: "news", priority: "high" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", category: "Tech", type: "news", priority: "high" },
  { name: "Engadget", url: "https://www.engadget.com/rss.xml", category: "Tech", type: "news", priority: "medium" },
  { name: "Mashable", url: "https://mashable.com/feeds/rss", category: "Tech", type: "news", priority: "medium" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", category: "Tech", type: "news", priority: "high" },
  
  // ============================================
  // SEO / PRODUCT REVIEW GIANTS (Highest Traffic)
  // ============================================
  { name: "CNET", url: "https://www.cnet.com/rss/news/", category: "Tech", type: "reviews", priority: "high" },
  { name: "TechRadar", url: "https://www.techradar.com/rss", category: "Best Picks", type: "reviews", priority: "high" },
  { name: "Tom's Guide", url: "https://www.tomsguide.com/feed", category: "Tech", type: "reviews", priority: "high" },
  { name: "PCMag", url: "https://feeds.pcmag.com/rss/news.aspx", category: "Tech", type: "reviews", priority: "medium" },
  { name: "Digital Trends", url: "https://www.digitaltrends.com/feed/", category: "Tech", type: "reviews", priority: "medium" },
  { name: "Lifewire", url: "https://www.lifewire.com/feed", category: "Tech", type: "reviews", priority: "medium" },
  { name: "MakeUseOf", url: "https://www.makeuseof.com/feed/", category: "Tech", type: "reviews", priority: "medium" },
  
  // ============================================
  // ENTERPRISE + B2B + WIRE SERVICES
  // ============================================
  { name: "ZDNet", url: "https://www.zdnet.com/news/rss.xml", category: "Tech", type: "enterprise", priority: "medium" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", category: "AI", type: "enterprise", priority: "high" },
  { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews", category: "Tech", type: "news", priority: "high" },
  
  // ============================================
  // DEVELOPER + AI ECOSYSTEM (High Influence)
  // ============================================
  { name: "Dev.to", url: "https://dev.to/feed", category: "Tech", type: "dev", priority: "high" },
  { name: "Hacker Noon", url: "https://hackernoon.com/feed", category: "Tech", type: "dev", priority: "medium" },
  { name: "Towards Data Science", url: "https://towardsdatascience.com/feed", category: "AI", type: "ai", priority: "high" },
  { name: "Analytics Vidhya", url: "https://www.analyticsvidhya.com/blog/feed/", category: "AI", type: "ai", priority: "medium" },
  { name: "GitHub Blog", url: "https://github.blog/feed/", category: "Tech", type: "dev", priority: "medium" },
  { name: "Stack Overflow Blog", url: "https://stackoverflow.blog/feed/", category: "Tech", type: "dev", priority: "medium" },
  { name: "AI News", url: "https://www.artificialintelligence-news.com/feed/", category: "AI", type: "ai", priority: "high" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/ai/feed/", category: "AI", type: "ai", priority: "high" },
  
  // ============================================
  // MOBILE ECOSYSTEM
  // ============================================
  { name: "Android Authority", url: "https://www.androidauthority.com/feed/", category: "Tech", type: "reviews", priority: "medium" },
  { name: "9to5Mac", url: "https://9to5mac.com/feed/", category: "Tech", type: "news", priority: "medium" },
  { name: "Windows Central", url: "https://www.windowscentral.com/rss", category: "Tech", type: "news", priority: "low" },
  { name: "MacRumors", url: "https://feeds.macrumors.com/MacRumors-All", category: "Tech", type: "news", priority: "medium" },
  
  // ============================================
  // BLOGGING PLATFORMS (Content Sources)
  // ============================================
  { name: "Medium Top Tech", url: "https://medium.com/feed/tag/technology", category: "Tech", type: "blog", priority: "medium" },
  { name: "Substack Popular", url: "https://substack.com/feed", category: "Tech", type: "blog", priority: "medium" },
  
  // ============================================
  // STARTUP & VC NEWS
  // ============================================
  { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", category: "Tech", type: "news", priority: "high" },
  { name: "Startup News", url: "https://startupnews.com.au/feed/", category: "Tech", type: "news", priority: "low" },
  
  // ============================================
  // SECURITY & HACKING
  // ============================================
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", category: "Tech", type: "news", priority: "medium" },
  { name: "Bleeping Computer", url: "https://www.bleepingcomputer.com/feed/", category: "Tech", type: "news", priority: "medium" },
  
  // ============================================
  // SCIENCE & FUTURE TECH
  // ============================================
  { name: "New Scientist", url: "https://www.newscientist.com/feed/", category: "Tech", type: "news", priority: "medium" },
  { name: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml", category: "Tech", type: "news", priority: "low" },
  
  // ============================================
  // SOCIAL MEDIA & INTERNET CULTURE
  // ============================================
  { name: "Social Media Today", url: "https://www.socialmediatoday.com/rss.xml", category: "Tech", type: "news", priority: "medium" },
  { name: "Search Engine Land", url: "https://searchengineland.com/feed", category: "Tech", type: "news", priority: "medium" },
];

export const CATEGORY_MAPPING: Record<string, string> = {
  news: "Tech",
  reviews: "Best Picks",
  dev: "Hacks",
  ai: "AI",
  enterprise: "Tech",
  blog: "Tech",
};

export function getFeedsByPriority(priority: "high" | "medium" | "low"): FeedConfig[] {
  return TECH_FEEDS.filter(f => f.priority === priority);
}

export function getFeedsByCategory(category: string): FeedConfig[] {
  return TECH_FEEDS.filter(f => f.category === category);
}