"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ValidationResult {
  type: "post" | "category";
  id: string;
  title: string;
  issue: string;
  action: "remove" | "update" | "keep";
  newCategory?: string;
  confidence: number;
}

interface ValidationStats {
  totalPosts: number;
  keep: number;
  update: number;
  remove: number;
  unpublished: number;
}

export default function AdminSettings() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "ads" | "social" | "validation">("general");
  
  // Validation state
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationStats, setValidationStats] = useState<ValidationStats | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  async function handleSave(envVars: Record<string, string>) {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envVars),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  }

  async function runValidation(action: "scan" | "auto" | "cleanup") {
    setValidating(true);
    setValidationMessage("");
    setValidationResults([]);
    setValidationStats(null);
    
    try {
      const response = await fetch("/api/validate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setValidationResults(data.results);
        setValidationStats(data.stats);
        setValidationMessage(data.message);
      } else {
        setValidationMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Validation failed:", error);
      setValidationMessage("Validation failed. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")}>
          General
        </TabButton>
        <TabButton active={activeTab === "ads"} onClick={() => setActiveTab("ads")}>
          Ads
        </TabButton>
        <TabButton active={activeTab === "social"} onClick={() => setActiveTab("social")}>
          Social Links
        </TabButton>
        <TabButton active={activeTab === "validation"} onClick={() => setActiveTab("validation")}>
          AI Validation
        </TabButton>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <SettingsSection title="Site Information">
          <p className="mb-4 text-sm text-muted">
            These settings are configured via environment variables in your Vercel project settings.
          </p>
          <ul className="space-y-2 text-sm">
            <li>• <code>NEXT_PUBLIC_SITE_NAME</code> - Your site name</li>
            <li>• <code>NEXT_PUBLIC_SITE_DESCRIPTION</code> - Site tagline</li>
            <li>• <code>NEXT_PUBLIC_AUTHOR_NAME</code> - Author name</li>
            <li>• <code>NEXT_PUBLIC_AUTHOR_BIO</code> - Author biography</li>
            <li>• <code>NEXT_PUBLIC_AUTHOR_IMAGE</code> - Author photo URL</li>
            <li>• <code>ADMIN_PASSWORD</code> - Login password</li>
            <li>• <code>AUTH_SECRET</code> - Session secret key</li>
          </ul>
          <p className="mt-4 text-sm text-muted">
            Go to your Vercel Dashboard → Project → Settings → Environment Variables to update these.
          </p>
        </SettingsSection>
      )}

      {/* Ad Settings */}
      {activeTab === "ads" && (
        <SettingsSection title="Advertisement Settings">
          <p className="mb-4 text-sm text-muted">
            Configure ads for your blog. Supports Google AdSense and custom ad code.
          </p>
          
          <h3 className="mb-4 font-medium">Google AdSense Setup</h3>
          <ol className="mb-6 space-y-2 text-sm">
            <li>1. Sign up at <a href="https://www.google.com/adsense" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Google AdSense</a></li>
            <li>2. Create ad units and get your <code>Ad Client</code> (Publisher ID) and <code>Ad Slot</code> IDs</li>
            <li>3. Add the following environment variables in Vercel:</li>
          </ol>

          <div className="space-y-4 rounded-lg border border-border bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
            <div>
              <span className="text-[var(--accent)]"># Header Banner Ad (728x90)</span><br/>
              NEXT_PUBLIC_AD_HEADER_ENABLED = true<br/>
              NEXT_PUBLIC_AD_HEADER_CLIENT = &quot;ca-pub-XXXXXXXX&quot;<br/>
              NEXT_PUBLIC_AD_HEADER_SLOT = &quot;XXXXXXXXXX&quot;
            </div>
            <div>
              <span className="text-[var(--accent)]"># In-Article Ad (300x250)</span><br/>
              NEXT_PUBLIC_AD_INARTICLE_ENABLED = true<br/>
              NEXT_PUBLIC_AD_INARTICLE_CLIENT = &quot;ca-pub-XXXXXXXX&quot;<br/>
              NEXT_PUBLIC_AD_INARTICLE_SLOT = &quot;XXXXXXXXXX&quot;<br/>
              NEXT_PUBLIC_AD_INARTICLE_AFTER = 3
            </div>
            <div>
              <span className="text-[var(--accent)]"># Footer Banner Ad</span><br/>
              NEXT_PUBLIC_AD_FOOTER_ENABLED = true<br/>
              NEXT_PUBLIC_AD_FOOTER_CLIENT = &quot;ca-pub-XXXXXXXX&quot;<br/>
              NEXT_PUBLIC_AD_FOOTER_SLOT = &quot;XXXXXXXXXX&quot;
            </div>
          </div>

          <h3 className="mb-4 mt-6 font-medium">Ad Placement Guide</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>• <strong>Header Ad:</strong> Shows below the navigation bar</li>
            <li>• <strong>In-Article Ad:</strong> Appears after paragraph 3 (configurable)</li>
            <li>• <strong>Footer Ad:</strong> Shows above the footer section</li>
          </ul>
        </SettingsSection>
      )}

      {/* Social Settings */}
      {activeTab === "social" && (
        <SettingsSection title="Social Media Links">
          <p className="mb-4 text-sm text-muted">
            Add your social media profile links to display in the author bio section.
          </p>
          <div className="space-y-4 font-mono text-sm">
            <div>NEXT_PUBLIC_SOCIAL_X = &quot;https://x.com/yourusername&quot;</div>
            <div>NEXT_PUBLIC_SOCIAL_FACEBOOK = &quot;https://facebook.com/yourpage&quot;</div>
            <div>NEXT_PUBLIC_SOCIAL_INSTAGRAM = &quot;https://instagram.com/yourusername&quot;</div>
            <div>NEXT_PUBLIC_SOCIAL_YOUTUBE = &quot;https://youtube.com/@yourchannel&quot;</div>
            <div>NEXT_PUBLIC_SOCIAL_LINKEDIN = &quot;https://linkedin.com/in/yourprofile&quot;</div>
          </div>
        </SettingsSection>
      )}

      {/* AI Validation Settings */}
      {activeTab === "validation" && (
        <SettingsSection title="AI Content Validation">
          <p className="mb-4 text-sm text-muted">
            Use AI to validate that all posts are relevant to their assigned categories and contain genuine, quality content.
          </p>
          
          {/* Validation Actions */}
          <div className="mb-6 space-y-4">
            <h3 className="font-medium">Validation Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => runValidation("scan")}
                disabled={validating}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {validating ? "Scanning..." : "🔍 Scan Content"}
              </button>
              <button
                onClick={() => runValidation("auto")}
                disabled={validating}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {validating ? "Processing..." : "⚡ Auto-Fix"} (Unpublish bad posts)
              </button>
              <button
                onClick={() => runValidation("cleanup")}
                disabled={validating}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {validating ? "Cleaning..." : "🧹 Cleanup"} (Remove empty categories)
              </button>
            </div>
          </div>

          {/* Validation Criteria */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h3 className="mb-3 font-medium">Validation Criteria</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>✅ <strong>Relevance:</strong> Content must contain keywords related to the category</li>
              <li>✅ <strong>Authenticity:</strong> No gibberish or placeholder text</li>
              <li>✅ <strong>Quality:</strong> Minimum 100 characters of meaningful content</li>
              <li>✅ <strong>No Spam:</strong> No promotional or misleading language</li>
            </ul>
          </div>

          {/* Results */}
          {validationMessage && (
            <div className={`mb-4 rounded-lg p-4 ${validationStats ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
              <p className="font-medium">{validationMessage}</p>
            </div>
          )}

          {validationStats && (
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total Posts" value={validationStats.totalPosts} color="gray" />
              <StatCard label="OK" value={validationStats.keep} color="green" />
              <StatCard label="Needs Review" value={validationStats.remove} color="amber" />
              <StatCard label="Auto-Fixed" value={validationStats.update} color="blue" />
            </div>
          )}

          {validationResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Detailed Results</h3>
              {validationResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}-${index}`}
                  className={`rounded-lg border p-4 ${
                    result.action === "keep"
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : result.action === "remove"
                      ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          result.action === "keep"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : result.action === "remove"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        }`}>
                          {result.action.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted">
                          {result.type === "post" ? "📄 Post" : "📁 Category"} • Confidence: {result.confidence}%
                        </span>
                      </div>
                      <h4 className="mt-2 font-medium">{result.title}</h4>
                      <p className="mt-1 text-sm text-muted">{result.issue}</p>
                      {result.action === "update" && result.newCategory && (
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                          Suggested category: {result.newCategory}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SettingsSection>
      )}

      {/* Success Message */}
      {saved && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-green-500 px-4 py-2 text-white shadow-lg">
          Settings saved successfully!
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

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-6">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: "gray" | "green" | "amber" | "blue" | "red" }) {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  
  return (
    <div className={`rounded-lg p-4 text-center ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}