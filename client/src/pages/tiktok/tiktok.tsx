"use client"

import { useState } from "react"
import { TikTokAnalyticsTab } from "./tab"

const TABS = [
  { id: "followers", label: "Follow", endpoint: "/api/tiktok/followers" },
  { id: "likes", label: "Like", endpoint: "/api/tiktok/likes" },
  { id: "views", label: "Views", endpoint: "/api/tiktok/views" },
  { id: "saves", label: "Save", endpoint: "/api/tiktok/saves" },
  { id: "shares", label: "Share", endpoint: "/api/tiktok/shares" },
{ id: "comments", label: "comments", endpoint: "/api/tiktok/comments" },
// { id: "comments-like", label: "comments like", endpoint: "/api/tiktok/comments-like" },
]

export default function TikTokAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("followers")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            TikTok Analytics Dashboard
          </h1>
          <p className="text-gray-400">Analyze TikTok metrics across different engagement types</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {TABS.map((tab) => (
          <div key={tab.id} className={activeTab === tab.id ? "block" : "hidden"}>
            <TikTokAnalyticsTab serviceType={tab.id} endpoint={tab.endpoint} label={tab.label} />
          </div>
        ))}
      </div>
    </div>
  )
}
