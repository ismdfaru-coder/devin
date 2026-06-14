"use client";

import { useState, useEffect, useCallback } from "react";

type AutoPostSettings = {
  enabled: boolean;
  schedule: string;
  postsPerRun: number;
  maxPostsPerDay: number;
  categories: string[];
  minArticleLength: number;
  autoPublish: boolean;
  ollamaEnabled: boolean;
  imageSource: string;
  researchMode: boolean;
  logLevel: string;
};

type TrendingTopic = {
  title: string;
  link: string;
  source: string;
  category: string;
  detectedCategory: string;
  score: number;
  pubDate: string;
};

type GeneratedPost = {
  id: string;
  title: string;
  category: string;
  published: boolean;
  success: boolean;
};

export default function AutopostPage() {
  const [settings, setSettings] = useState<AutoPostSettings>({
    enabled: false,
    schedule: "3x-daily",
    postsPerRun: 3,
    maxPostsPerDay: 9,
    categories: ["Tech", "AI", "Programming", "Gadgets"],
    minArticleLength: 300,
    autoPublish: false,
    ollamaEnabled: false,
    imageSource: "unsplash",
    researchMode: true,
    logLevel: "info",
  });
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [instantPosting, setInstantPosting] = useState(false);
  const [instantProgress, setInstantProgress] = useState(0);
  const [instantTotal, setInstantTotal] = useState(0);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "trending" | "logs">("settings");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Debounced save
  const saveSettings = useCallback(async (newSettings: AutoPostSettings) => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/autopost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }, []);

  // Auto-save on settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (saveStatus === "idle") {
        saveSettings(settings);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [settings, saveStatus, saveSettings]);

  useEffect(() => {
    loadSettings();
    loadTrending();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/autopost");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async function loadTrending() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-article");
      const data = await res.json();
      if (data.success) {
        setTrendingTopics(data.trendingTopics);
      }
    } catch (error) {
      console.error("Failed to load trends:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateArticle(topic: TrendingTopic) {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.title,
          sourceItems: [topic],
          category: topic.category,
          useAI: settings.ollamaEnabled,
          autoPublish: settings.autoPublish,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: settings.autoPublish 
            ? `✅ Published: "${data.article.title}"` 
            : `📝 Draft created: "${data.article.title}"`,
        });
        window.open(`/admin/edit/${data.article.id}`, "_blank");
      } else {
        setMessage({ type: "error", text: "Failed to generate article" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to generate article" });
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }

  async function generateBatch(count: number) {
    if (!confirm(`Generate ${count} articles from trending topics?`)) return;
    
    setGenerating(true);
    let successCount = 0;
    
    for (let i = 0; i < Math.min(count, trendingTopics.length); i++) {
      try {
        const res = await fetch("/api/generate-article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: trendingTopics[i].title,
            sourceItems: [trendingTopics[i]],
            category: trendingTopics[i].detectedCategory || trendingTopics[i].category,
            useAI: settings.ollamaEnabled,
            autoPublish: settings.autoPublish,
          }),
        });
        const data = await res.json();
        if (data.success) successCount++;
      } catch {
        // Continue with next
      }
    }
    
    setMessage({
      type: "success",
      text: `✅ Generated ${successCount}/${count} articles!`,
    });
    setGenerating(false);
    setTimeout(() => setMessage(null), 5000);
  }

  // POST NOW - Instantly fetch trending and publish
  async function postNow(count: number = 5) {
    if (!confirm(`🚀 POST NOW: Fetch trending topics and publish ${count} articles instantly?`)) return;
    
    setInstantPosting(true);
    setInstantTotal(count);
    setInstantProgress(0);
    setGeneratedPosts([]);
    setMessage({ type: "success", text: "🔍 Fetching trending topics..." });
    
    try {
      // First fetch trending topics
      const trendsRes = await fetch("/api/generate-article");
      const trendsData = await trendsRes.json();
      
      if (!trendsData.success || !trendsData.trendingTopics?.length) {
        setMessage({ type: "error", text: "Failed to fetch trending topics" });
        setInstantPosting(false);
        return;
      }
      
      const topics = trendsData.trendingTopics.slice(0, count);
      const results: GeneratedPost[] = [];
      
      // Publish each one
      for (let i = 0; i < topics.length; i++) {
        setInstantProgress(i);
        setMessage({ type: "success", text: `📝 Publishing ${i + 1}/${count}: ${topics[i].title.slice(0, 50)}...` });
        
        try {
          const res = await fetch("/api/generate-article", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: topics[i].title,
              sourceItems: [topics[i]],
              category: topics[i].detectedCategory || topics[i].category,
              useAI: settings.ollamaEnabled,
              autoPublish: true, // Always publish for POST NOW
            }),
          });
          const data = await res.json();
          
          if (data.success) {
            results.push({
              id: data.article.id,
              title: data.article.title,
              category: data.article.category,
              published: true,
              success: true,
            });
          }
        } catch (error) {
          console.error(`Failed to publish: ${topics[i].title}`, error);
        }
        
        // Small delay between posts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setInstantProgress(count);
      setGeneratedPosts(results);
      
      const publishedCount = results.filter(r => r.success).length;
      setMessage({ 
        type: "success", 
        text: `🎉 SUCCESS! Published ${publishedCount}/${count} articles!` 
      });
      
      // Reload trending
      loadTrending();
      
    } catch (error) {
      setMessage({ type: "error", text: "Failed to complete POST NOW" });
    } finally {
      setInstantPosting(false);
      setTimeout(() => setMessage(null), 10000);
    }
  }

  const allCategories = ["Tech", "AI", "Programming", "Gadgets", "Cybersecurity", "Startups", "Science", "Software", "Best Picks"];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 AI Content Engine</h1>
          <p className="mt-1 text-muted">Fully automated content aggregation & publishing</p>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-4 py-2 font-medium ${
            settings.enabled 
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            {settings.enabled ? "🟢 AUTO-POST ON" : "⚫ AUTO-POST OFF"}
          </span>
          <button
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`relative h-10 w-16 rounded-full transition-colors ${
              settings.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-8 w-8 rounded-full bg-white shadow transition-transform ${
                settings.enabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Schedule Banner */}
      {settings.enabled && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌅</span>
              <div>
                <p className="font-medium">Morning</p>
                <p className="text-sm text-muted">08:00 UTC</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌞</span>
              <div>
                <p className="font-medium">Afternoon</p>
                <p className="text-sm text-muted">13:00 UTC</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌙</span>
              <div>
                <p className="font-medium">Evening</p>
                <p className="text-sm text-muted">19:00 UTC</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="font-medium">{settings.maxPostsPerDay} posts/day max</p>
              <p className="text-sm text-muted">{settings.postsPerRun} per cycle</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
          ⚙️ Settings
        </TabButton>
        <TabButton active={activeTab === "trending"} onClick={() => setActiveTab("trending")}>
          📈 Trending ({trendingTopics.length})
        </TabButton>
        <TabButton active={activeTab === "logs"} onClick={() => setActiveTab("logs")}>
          📋 Activity Log
        </TabButton>
      </div>

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* POST NOW Button */}
          <div className="rounded-xl border-2 border-red-500 bg-red-50 p-6 dark:bg-red-950">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <h3 className="text-xl font-bold">🚀 POST NOW</h3>
                <p className="mt-1 text-sm text-muted">
                  Instantly fetch trending topics and publish articles immediately
                </p>
              </div>
              
              {instantPosting && (
                <div className="w-full max-w-md">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Publishing...</span>
                    <span>{instantProgress}/{instantTotal}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${instantTotal > 0 ? (instantProgress / instantTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
              
              {generatedPosts.length > 0 && (
                <div className="w-full max-w-md rounded-lg bg-white p-4 dark:bg-gray-900">
                  <h4 className="mb-2 font-medium">✅ Published Articles:</h4>
                  <ul className="space-y-1 text-sm">
                    {generatedPosts.map((post, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="truncate">{post.title}</span>
                        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                          {post.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => postNow(3)}
                  disabled={instantPosting}
                  className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {instantPosting ? "Publishing..." : "🔥 POST 3 NOW"}
                </button>
                <button
                  onClick={() => postNow(5)}
                  disabled={instantPosting}
                  className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {instantPosting ? "Publishing..." : "🚀 POST 5 NOW"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => generateBatch(1)}
              disabled={generating}
              className="rounded-lg border-2 border-[var(--accent)] bg-[var(--accent)]/10 p-4 text-center hover:bg-[var(--accent)]/20"
            >
              <p className="text-2xl">✍️</p>
              <p className="mt-1 font-medium">Generate 1</p>
            </button>
            <button
              onClick={() => generateBatch(3)}
              disabled={generating}
              className="rounded-lg border-2 border-green-500 bg-green-50 p-4 text-center hover:bg-green-100 dark:bg-green-950"
            >
              <p className="text-2xl">📝</p>
              <p className="mt-1 font-medium">Generate 3</p>
            </button>
            <button
              onClick={() => generateBatch(5)}
              disabled={generating}
              className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4 text-center hover:bg-blue-100 dark:bg-blue-950"
            >
              <p className="text-2xl">📚</p>
              <p className="mt-1 font-medium">Generate 5</p>
            </button>
            <button
              onClick={() => generateBatch(10)}
              disabled={generating}
              className="rounded-lg border-2 border-purple-500 bg-purple-50 p-4 text-center hover:bg-purple-100 dark:bg-purple-950"
            >
              <p className="text-2xl">🚀</p>
              <p className="mt-1 font-medium">Generate 10</p>
            </button>
          </div>

          {/* Schedule */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-medium">⏰ Publishing Schedule</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium">Schedule Type</label>
                <select
                  value={settings.schedule}
                  onChange={(e) => setSettings({ ...settings, schedule: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900"
                >
                  <option value="3x-daily">3x Daily (8AM, 1PM, 7PM)</option>
                  <option value="2x-daily">2x Daily (8AM, 6PM)</option>
                  <option value="1x-daily">1x Daily (8AM)</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Posts Per Run</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.postsPerRun}
                  onChange={(e) => setSettings({ ...settings, postsPerRun: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Max Posts/Day</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.maxPostsPerDay}
                  onChange={(e) => setSettings({ ...settings, maxPostsPerDay: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-medium">📁 Target Categories</h3>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <label
                  key={cat}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-colors ${
                    settings.categories.includes(cat)
                      ? "bg-[var(--accent)] text-white"
                      : "border border-border hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.categories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({ ...settings, categories: [...settings.categories, cat] });
                      } else {
                        setSettings({ ...settings, categories: settings.categories.filter(c => c !== cat) });
                      }
                    }}
                    className="hidden"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* AI Settings */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-medium">🤖 AI Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Use Ollama AI (Local)</p>
                  <p className="text-sm text-muted">Generate original articles with local AI</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ollamaEnabled}
                  onChange={(e) => setSettings({ ...settings, ollamaEnabled: e.target.checked })}
                  className="h-5 w-5 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Research Mode</p>
                  <p className="text-sm text-muted">Analyze sources before generating</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.researchMode}
                  onChange={(e) => setSettings({ ...settings, researchMode: e.target.checked })}
                  className="h-5 w-5 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Image Source</label>
                <select
                  value={settings.imageSource}
                  onChange={(e) => setSettings({ ...settings, imageSource: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900"
                >
                  <option value="unsplash">Unsplash (Recommended)</option>
                  <option value="pixabay">Pixabay</option>
                  <option value="pexels">Pexels</option>
                </select>
              </div>
            </div>
          </div>

          {/* Publishing */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-medium">📤 Publishing</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Publish</p>
                <p className="text-sm text-muted">Skip draft review and publish directly</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPublish}
                onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                className="h-5 w-5 rounded"
              />
            </div>
          </div>

          {/* Save Status */}
          <div className="flex items-center justify-center gap-2 py-2">
            {saveStatus === "saving" && <span className="text-muted">Saving...</span>}
            {saveStatus === "saved" && <span className="text-green-600">✅ Settings saved</span>}
            {saveStatus === "error" && <span className="text-red-600">❌ Failed to save</span>}
          </div>
        </div>
      )}

      {/* Trending Tab */}
      {activeTab === "trending" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">📈 Trending Topics</h3>
              <p className="text-sm text-muted">
                {trendingTopics.length} topics from 42 RSS sources
              </p>
            </div>
            <button
              onClick={loadTrending}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="rounded-lg border border-border p-4 hover:border-[var(--accent)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                        Score: {Math.round(topic.score)}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                        {topic.source}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {topic.category}
                      </span>
                    </div>
                    <h4 className="mt-2 font-medium leading-tight">{topic.title}</h4>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(topic.pubDate).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => generateArticle(topic)}
                    disabled={generating}
                    className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {generating ? "..." : "✍️ Generate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="rounded-lg border border-border p-8">
          <h3 className="mb-4 font-medium">📋 Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Auto-post system ready</span>
              <span className="ml-auto text-xs text-muted">Just now</span>
            </div>
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <span className="text-blue-500">📡</span>
              <span className="text-sm">42 RSS sources configured</span>
              <span className="ml-auto text-xs text-muted">Active</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted">ℹ️</span>
              <span className="text-sm text-muted">Enable auto-post to start scheduled publishing</span>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed bottom-4 right-4 rounded-lg px-6 py-3 shadow-lg ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {message.text}
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