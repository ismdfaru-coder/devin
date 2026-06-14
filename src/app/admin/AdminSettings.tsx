"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "ads" | "social">("general");

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

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")}>
          General
        </TabButton>
        <TabButton active={activeTab === "ads"} onClick={() => setActiveTab("ads")}>
          Ads
        </TabButton>
        <TabButton active={activeTab === "social"} onClick={() => setActiveTab("social")}>
          Social Links
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