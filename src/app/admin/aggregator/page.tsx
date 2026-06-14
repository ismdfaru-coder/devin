"use client";

import { useState, useEffect } from "react";

type FeedItem = {
  title: string;
  link: string;
  excerpt: string;
  pubDate: string;
  source: string;
  category: string;
};

type FeedSource = {
  name: string;
  url: string;
  type: string;
  priority: string;
};

export default function AggregatorPage() {
  const [activeTab, setActiveTab] = useState<"browse" | "sources" | "schedule">("browse");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [feedsByCategory, setFeedsByCategory] = useState<Record<string, FeedSource[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadFeeds();
    loadSources();
  }, []);

  async function loadFeeds() {
    setLoading(true);
    try {
      const res = await fetch("/api/aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch_latest" }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to load feeds:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSources() {
    try {
      const res = await fetch("/api/aggregate");
      const data = await res.json();
      if (data.success) {
        setFeedsByCategory(data.feedsByCategory);
      }
    } catch (error) {
      console.error("Failed to load sources:", error);
    }
  }

  async function createDraft(item: FeedItem, index: number, feedUrl: string) {
    setCreatingId(index);
    try {
      const res = await fetch("/api/aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_draft",
          feedUrl,
          itemIndex: index,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Draft created! Edit it here: ${data.editUrl}`);
        window.open(data.editUrl, "_blank");
      } else {
        alert("Failed to create draft: " + data.error);
      }
    } catch (error) {
      alert("Failed to create draft");
    } finally {
      setCreatingId(null);
    }
  }

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Aggregator</h1>
        <p className="mt-1 text-muted">Browse tech news feeds and create drafts</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        <TabButton active={activeTab === "browse"} onClick={() => setActiveTab("browse")}>
          Browse Feeds
        </TabButton>
        <TabButton active={activeTab === "sources"} onClick={() => setActiveTab("sources")}>
          Feed Sources ({Object.values(feedsByCategory).flat().length})
        </TabButton>
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>
          Auto-Post Settings
        </TabButton>
      </div>

      {/* Browse Feeds Tab */}
      {activeTab === "browse" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3 py-1 text-sm ${
                selectedCategory === "all"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "border border-border hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              All
            </button>
            {Object.keys(feedsByCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-sm ${
                  selectedCategory === cat
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-border hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={loadFeeds}
              disabled={loading}
              className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh Feeds"}
            </button>
          </div>

          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--accent)]" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-4 hover:border-[var(--accent)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                          {item.source}
                        </span>
                        <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[var(--accent)]">
                          {item.category}
                        </span>
                        <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="mt-2 font-medium">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted line-clamp-2">{item.excerpt}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        View Original
                      </a>
                      <button
                        onClick={() => createDraft(item, index, "")}
                        disabled={creatingId === index}
                        className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {creatingId === index ? "Creating..." : "Create Draft"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sources Tab */}
      {activeTab === "sources" && (
        <div>
          <div className="mb-4 rounded-lg border border-border bg-blue-50 p-4 dark:bg-blue-950">
            <h3 className="font-medium">📡 RSS Feed Sources</h3>
            <p className="mt-1 text-sm text-muted">
              These {Object.values(feedsByCategory).flat().length} RSS feeds are monitored for content.
              High priority feeds are checked more frequently.
            </p>
          </div>

          {Object.entries(feedsByCategory).map(([category, feeds]) => (
            <div key={category} className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 font-medium">
                <span className="rounded-full bg-gray-100 px-3 py-0.5 text-sm dark:bg-gray-800">
                  {category}
                </span>
                <span className="text-sm text-muted">({feeds.length} sources)</span>
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {feeds.map((feed) => (
                  <div
                    key={feed.name}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{feed.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          feed.priority === "high"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : feed.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {feed.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted truncate">{feed.url}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6">
            <h3 className="font-medium">⏰ Auto-Post Settings</h3>
            <p className="mt-1 text-sm text-muted">
              Configure automatic content aggregation and posting schedule.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">Posting Schedule</label>
                <select className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900">
                  <option value="daily">Daily (once a day)</option>
                  <option value="twice">Twice daily</option>
                  <option value="manual">Manual only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Morning Post Time (UTC)</label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900"
                />
                <p className="mt-1 text-xs text-muted">Posts will be published at this time daily</p>
              </div>

              <div>
                <label className="block text-sm font-medium">Content Sources</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>High Priority Feeds Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Include Developer Content</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Include AI/ML News</span>
                  </label>
                </div>
              </div>

              <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white hover:opacity-90">
                Save Settings
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border p-6">
            <h3 className="font-medium">🤖 AI Summarization</h3>
            <p className="mt-1 text-sm text-muted">
              Use free AI (Ollama) to rewrite content in your own style.
            </p>
            
            <div className="mt-4">
              <label className="block text-sm font-medium">AI Provider</label>
              <select className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900">
                <option value="ollama">Ollama (Local, Free)</option>
                <option value="none">None (Use excerpts only)</option>
              </select>
              <p className="mt-1 text-xs text-muted">
                Ollama runs locally on your machine. Download from ollama.com
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
            <h3 className="font-medium">📋 How Auto-Posting Works</h3>
            <ol className="mt-3 space-y-2 text-sm text-muted">
              <li>1. System fetches RSS feeds daily at scheduled time</li>
              <li>2. New articles are summarized using AI (if configured)</li>
              <li>3. Draft posts are created in your admin panel</li>
              <li>4. You review and publish with one click</li>
              <li>5. Posts appear on your blog with source attribution</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}