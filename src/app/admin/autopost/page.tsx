"use client";

import { useState, useEffect } from "react";

type AutoPostSettings = {
  enabled: boolean;
  schedule: string;
  postsPerDay: number;
  categories: string[];
  minArticleLength: number;
  autoPublish: boolean;
  ollamaEnabled: boolean;
  imageSource: string;
};

type TrendingTopic = {
  title: string;
  link: string;
  source: string;
  category: string;
  score: number;
};

export default function AutopostPage() {
  const [settings, setSettings] = useState<AutoPostSettings>({
    enabled: false,
    schedule: "0 8 * * *",
    postsPerDay: 3,
    categories: ["Tech", "AI", "Best Picks"],
    minArticleLength: 300,
    autoPublish: false,
    ollamaEnabled: false,
    imageSource: "pixabay",
  });
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "trending" | "history">("settings");

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
    try {
      const res = await fetch("/api/generate-article");
      const data = await res.json();
      if (data.success) {
        setTrendingTopics(data.trendingTopics);
      }
    } catch (error) {
      console.error("Failed to load trends:", error);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/autopost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
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
            ? `Article published: "${data.article.title}"` 
            : `Draft created: "${data.article.title}"`,
        });
        window.open(`/admin/edit/${data.article.id}`, "_blank");
      } else {
        setMessage({ type: "error", text: "Failed to generate article" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to generate article" });
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }

  async function generateAllTrending() {
    if (!confirm(`Generate articles for top ${settings.postsPerDay} trending topics?`)) return;
    
    setGenerating(true);
    let successCount = 0;
    
    for (let i = 0; i < Math.min(settings.postsPerDay, trendingTopics.length); i++) {
      try {
        const res = await fetch("/api/generate-article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: trendingTopics[i].title,
            sourceItems: [trendingTopics[i]],
            category: trendingTopics[i].category,
            useAI: settings.ollamaEnabled,
            autoPublish: settings.autoPublish,
          }),
        });
        const data = await res.json();
        if (data.success) successCount++;
      } catch {
        // Continue with next topic
      }
    }
    
    setMessage({
      type: "success",
      text: `Generated ${successCount} articles successfully!`,
    });
    setGenerating(false);
    setTimeout(() => setMessage(null), 5000);
  }

  const allCategories = ["Tech", "Best Picks", "Health", "Home & Garden", "Comparisons", "Hacks", "AI", "Competitors"];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 AI Auto-Post System</h1>
          <p className="mt-1 text-muted">Autonomous content generation and publishing</p>
        </div>
        
        {/* ON/OFF Toggle */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {settings.enabled ? "🟢 AUTO-POST ON" : "⚫ AUTO-POST OFF"}
          </span>
          <button
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              settings.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                settings.enabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
          ⚙️ Settings
        </TabButton>
        <TabButton active={activeTab === "trending"} onClick={() => setActiveTab("trending")}>
          📈 Trending Topics ({trendingTopics.length})
        </TabButton>
        <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
          📋 Generation History
        </TabButton>
      </div>

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Master Switch */}
          <div className="rounded-lg border-2 border-[var(--accent)] bg-[var(--accent)]/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">🚀 Enable Auto-Posting</h3>
                <p className="text-sm text-muted">
                  When enabled, the system will automatically generate and publish content daily
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                className={`relative h-12 w-20 rounded-full transition-colors ${
                  settings.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-10 w-10 rounded-full bg-white shadow transition-transform ${
                    settings.enabled ? "translate-x-8" : ""
                  }`}
                />
                <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                  settings.enabled ? "text-white" : "text-gray-600"
                }`}>
                  {settings.enabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          {/* Schedule Settings */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-medium">⏰ Posting Schedule</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Cron Schedule</label>
                <input
                  type="text"
                  value={settings.schedule}
                  onChange={(e) => setSettings({ ...settings, schedule: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900"
                  placeholder="0 8 * * *"
                />
                <p className="mt-1 text-xs text-muted">
                  Current: Daily at 8:00 AM. Format: minute hour day month weekday
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">Posts Per Day</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.postsPerDay}
                  onChange={(e) => setSettings({ ...settings, postsPerDay: parseInt(e.target.value) })}
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
                <label key={cat} className="flex items-center gap-2">
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
                    className="rounded"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Settings */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-medium">🤖 AI Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Use Ollama AI (Local)</span>
                  <p className="text-sm text-muted">
                    Generate original articles using local AI (requires Ollama installation)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ollamaEnabled}
                  onChange={(e) => setSettings({ ...settings, ollamaEnabled: e.target.checked })}
                  className="h-5 w-5 rounded"
                />
              </label>
              <div>
                <label className="block text-sm font-medium">Image Source</label>
                <select
                  value={settings.imageSource}
                  onChange={(e) => setSettings({ ...settings, imageSource: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900"
                >
                  <option value="unsplash">Unsplash (Free)</option>
                  <option value="pixabay">Pixabay (Free)</option>
                  <option value="pexels">Pexels (Free)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Minimum Article Length (words)</label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  value={settings.minArticleLength}
                  onChange={(e) => setSettings({ ...settings, minArticleLength: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 dark:bg-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Publishing Settings */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 font-medium">📤 Publishing</h3>
            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Auto-Publish Generated Articles</span>
                <p className="text-sm text-muted">
                  Publish directly without manual review (⚠️ recommended to keep OFF)
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPublish}
                onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                className="h-5 w-5 rounded"
              />
            </label>
          </div>

          {/* Ollama Setup Guide */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
            <h3 className="mb-2 font-medium text-blue-700 dark:text-blue-300">🖥️ Ollama Setup (Optional)</h3>
            <p className="mb-3 text-sm text-muted">
              For AI-powered article generation, install Ollama on your local machine:
            </p>
            <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-green-400">
{`# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2

# Start Ollama server
ollama serve

# Set environment variable in Vercel:
OLLAMA_URL=http://localhost:11434`}
            </pre>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full rounded-lg bg-[var(--accent)] py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "💾 Save Settings"}
          </button>
        </div>
      )}

      {/* Trending Tab */}
      {activeTab === "trending" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">📈 Trending Topics</h3>
              <p className="text-sm text-muted">
                AI will generate original articles based on these trending topics
              </p>
            </div>
            <button
              onClick={generateAllTrending}
              disabled={generating || trendingTopics.length === 0}
              className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {generating ? "Generating..." : `🚀 Generate ${settings.postsPerDay} Articles`}
            </button>
          </div>

          <div className="space-y-4">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs text-[var(--accent)]">
                        Score: {Math.round(topic.score)}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                        {topic.source}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {topic.category}
                      </span>
                    </div>
                    <h4 className="mt-2 font-medium">{topic.title}</h4>
                    <a
                      href={topic.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs text-muted hover:text-[var(--accent)]"
                    >
                      {topic.link}
                    </a>
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

          <button
            onClick={loadTrending}
            className="w-full rounded-lg border border-border py-2 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            🔄 Refresh Trending Topics
          </button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-4xl">📋</p>
          <h3 className="mt-4 font-medium">Generation History</h3>
          <p className="mt-2 text-sm text-muted">
            Articles generated by the auto-post system will appear here.
          </p>
          <a
            href="/admin"
            className="mt-4 inline-block text-[var(--accent)] hover:underline"
          >
            View all posts in Admin →
          </a>
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