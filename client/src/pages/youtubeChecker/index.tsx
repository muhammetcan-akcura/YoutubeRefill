"use client"
import { useState } from "react"
import axios from "axios"
import { Search, ExternalLink, CheckCircle, XCircle, AlertCircle, Video } from "lucide-react"

interface VideoCheckResult {
    success: boolean
    videoId?: string
    title?: string
    author?: string
    thumbnail?: string
    embedAllowed?: boolean
    accessible?: boolean
    error?: string
    errorReason?: string
    status?: number
    privacyStatus?: string
    ageRestricted?: boolean
    madeForKids?: boolean
    uploadStatus?: string
    problems?: string[]
}

export default function YouTubeVideoChecker() {
    const [videoLink, setVideoLink] = useState("")
    const [bulkLinks, setBulkLinks] = useState("")
    const [result, setResult] = useState<VideoCheckResult | null>(null)
    const [bulkResults, setBulkResults] = useState<VideoCheckResult[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')

    const handleCheck = async () => {
        if (!videoLink.trim()) {
            alert("Please enter a YouTube link")
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await axios.post("https://youtuberefill-1.onrender.com/api/youtube/check", {
                link: videoLink.trim(),
            })

            setResult(response.data)
        } catch (err: any) {
            console.error("Video check error:", err)
            setResult({
                success: false,
                error: err.response?.data?.error || "An error occurred",
                errorReason: err.response?.data?.errorReason || "unknown_error",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleBulkCheck = async () => {
        const links = bulkLinks.split('\n').map(l => l.trim()).filter(l => l.length > 0)

        if (links.length === 0) {
            alert("Please enter at least one YouTube link")
            return
        }

        setLoading(true)
        setBulkResults([])

        const results: VideoCheckResult[] = []

        for (const link of links) {
            try {
                const response = await axios.post("https://youtuberefill-1.onrender.com/api/youtube/check", {
                    link: link,
                })
                results.push(response.data)
            } catch (err: any) {
                results.push({
                    success: false,
                    error: err.response?.data?.error || "An error occurred",
                    errorReason: err.response?.data?.errorReason || "unknown_error",
                })
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        setBulkResults(results)
        setLoading(false)
    }

    const handleOpenVideo = () => {
        if (result?.videoId) {
            window.open(`https://www.youtube.com/watch?v=${result.videoId}`, "_blank", "noopener,noreferrer")
        }
    }

    const getErrorMessage = (errorReason?: string) => {
        switch (errorReason) {
            case "not_found":
                return "Video not found or deleted"
            case "embedding_disabled":
                return "Embedding disabled or private video"
            case "age_restricted":
                return "Video is age restricted"
            case "video_private":
                return "Video is private or unlisted"
            case "made_for_kids":
                return "Video is made for kids (embedding restrictions)"
            case "playback_restricted":
                return "Video has playback restrictions"
            case "invalid_url":
                return "Invalid YouTube URL format"
            case "api_error":
                return "API error occurred"
            default:
                return "Unknown error"
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                        <Video className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white">YouTube Video Checker</h1>
                </div>
                <p className="text-slate-400 text-lg">
                    Check video information and accessibility by entering a YouTube video link
                </p>
            </div>

            {/* Tab Selector */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="flex gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${activeTab === 'single'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        Single Check
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${activeTab === 'bulk'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        Bulk Check
                    </button>
                </div>
            </div>

            {/* Single Check Input Section */}
            {activeTab === 'single' && (
                <div className="max-w-3xl mx-auto mb-8">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            YouTube Video Link
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={videoLink}
                                onChange={(e) => setVideoLink(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleCheck()}
                                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                                className="flex-1 p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                            />
                            <button
                                onClick={handleCheck}
                                disabled={loading}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Check Video
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Check Input Section */}
            {activeTab === 'bulk' && (
                <div className="max-w-3xl mx-auto mb-8">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            YouTube Video Links (one per line)
                        </label>
                        <textarea
                            value={bulkLinks}
                            onChange={(e) => setBulkLinks(e.target.value)}
                            placeholder={"https://www.youtube.com/watch?v=...\nhttps://youtu.be/...\nhttps://www.youtube.com/watch?v=..."}
                            rows={10}
                            className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                        />
                        <button
                            onClick={handleBulkCheck}
                            disabled={loading}
                            className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Checking {bulkResults.length} / {bulkLinks.split('\n').filter(l => l.trim()).length}...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Check All Videos
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Single Check Results Section */}
            {activeTab === 'single' && result && (
                <div className="max-w-3xl mx-auto">
                    <div
                        className={`bg-slate-800 border rounded-xl p-6 ${result.success
                            ? 'border-green-500/50 bg-green-900/10'
                            : 'border-red-500/50 bg-red-900/10'
                            }`}
                    >
                        {/* Status Header */}
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                            {result.success ? (
                                <>
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-green-400">Video Accessible</h2>
                                        <p className="text-slate-400">Video found successfully and is accessible</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                        <XCircle className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-red-400">Video Not Accessible</h2>
                                        <p className="text-slate-400">{getErrorMessage(result.errorReason)}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Video Details */}
                        {result.success && (
                            <div className="space-y-4">
                                {/* Thumbnail */}
                                {result.thumbnail && (
                                    <div className="rounded-lg overflow-hidden">
                                        <img
                                            src={result.thumbnail}
                                            alt={result.title}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}

                                {/* Video Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Video className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-400">Video Title</span>
                                        </div>
                                        <p className="text-white font-medium">{result.title}</p>
                                    </div>

                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-400">Channel</span>
                                        </div>
                                        <p className="text-white font-medium">{result.author}</p>
                                    </div>

                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-400">Video ID</span>
                                        </div>
                                        <p className="text-white font-mono text-sm">{result.videoId}</p>
                                    </div>

                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-400">Embed Status</span>
                                        </div>
                                        <p className={`font-medium ${result.embedAllowed ? 'text-green-400' : 'text-red-400'}`}>
                                            {result.embedAllowed ? "Enabled" : "Disabled"}
                                        </p>
                                    </div>

                                    {result.privacyStatus && (
                                        <div className="bg-slate-900 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-400">Privacy Status</span>
                                            </div>
                                            <p className={`font-medium ${result.privacyStatus === 'public' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {result.privacyStatus}
                                            </p>
                                        </div>
                                    )}

                                    {result.ageRestricted !== undefined && (
                                        <div className="bg-slate-900 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-400">Age Restricted</span>
                                            </div>
                                            <p className={`font-medium ${result.ageRestricted ? 'text-red-400' : 'text-green-400'}`}>
                                                {result.ageRestricted ? "Yes" : "No"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Open Video Button */}
                                <button
                                    onClick={handleOpenVideo}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Open on YouTube
                                </button>
                            </div>
                        )}

                        {/* Error Details */}
                        {!result.success && (
                            <div className="space-y-3">
                                <div className="bg-slate-900 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-slate-400">Error Detail</span>
                                    </div>
                                    <p className="text-red-400 font-medium">{result.error}</p>
                                </div>

                                {result.videoId && (
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-400">Video ID</span>
                                        </div>
                                        <p className="text-white font-mono text-sm">{result.videoId}</p>
                                    </div>
                                )}

                                {result.status && (
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-400">HTTP Status</span>
                                        </div>
                                        <p className="text-white font-mono text-sm">{result.status}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bulk Check Results Section */}
            {activeTab === 'bulk' && bulkResults.length > 0 && (
                <div className="max-w-5xl mx-auto mb-8">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                            <div className="text-slate-400 text-sm mb-1">Total Checked</div>
                            <div className="text-3xl font-bold text-white">{bulkResults.length}</div>
                        </div>
                        <div className="bg-slate-800 border border-green-500/50 rounded-xl p-6">
                            <div className="text-slate-400 text-sm mb-1">Accessible</div>
                            <div className="text-3xl font-bold text-green-400">
                                {bulkResults.filter(r => r.success).length}
                            </div>
                        </div>
                        <div className="bg-slate-800 border border-red-500/50 rounded-xl p-6">
                            <div className="text-slate-400 text-sm mb-1">Not Accessible</div>
                            <div className="text-3xl font-bold text-red-400">
                                {bulkResults.filter(r => !r.success).length}
                            </div>
                        </div>
                    </div>

                    {/* Individual Results */}
                    <div className="space-y-4">
                        {bulkResults.map((bulkResult, index) => (
                            <div
                                key={index}
                                className={`bg-slate-800 border rounded-xl p-4 ${bulkResult.success
                                    ? 'border-green-500/50 bg-green-900/10'
                                    : 'border-red-500/50 bg-red-900/10'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Status Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bulkResult.success ? 'bg-green-600' : 'bg-red-600'
                                        }`}>
                                        {bulkResult.success ? (
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-white" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold text-lg ${bulkResult.success ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {bulkResult.success ? 'Accessible' : 'Not Accessible'}
                                                </h3>
                                                {bulkResult.title && (
                                                    <p className="text-white font-medium truncate">{bulkResult.title}</p>
                                                )}
                                                {bulkResult.author && (
                                                    <p className="text-slate-400 text-sm">{bulkResult.author}</p>
                                                )}
                                            </div>
                                            {bulkResult.thumbnail && (
                                                <img
                                                    src={bulkResult.thumbnail}
                                                    alt={bulkResult.title || 'Video thumbnail'}
                                                    className="w-32 h-18 object-cover rounded-lg flex-shrink-0"
                                                />
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                            {bulkResult.videoId && (
                                                <div>
                                                    <span className="text-slate-400">ID:</span>{' '}
                                                    <span className="text-white font-mono">{bulkResult.videoId}</span>
                                                </div>
                                            )}
                                            {bulkResult.privacyStatus && (
                                                <div>
                                                    <span className="text-slate-400">Privacy:</span>{' '}
                                                    <span className={bulkResult.privacyStatus === 'public' ? 'text-green-400' : 'text-yellow-400'}>
                                                        {bulkResult.privacyStatus}
                                                    </span>
                                                </div>
                                            )}
                                            {bulkResult.ageRestricted !== undefined && (
                                                <div>
                                                    <span className="text-slate-400">Age Restricted:</span>{' '}
                                                    <span className={bulkResult.ageRestricted ? 'text-red-400' : 'text-green-400'}>
                                                        {bulkResult.ageRestricted ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            )}
                                            {bulkResult.embedAllowed !== undefined && (
                                                <div>
                                                    <span className="text-slate-400">Embed:</span>{' '}
                                                    <span className={bulkResult.embedAllowed ? 'text-green-400' : 'text-red-400'}>
                                                        {bulkResult.embedAllowed ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Error Message */}
                                        {!bulkResult.success && bulkResult.error && (
                                            <div className="mt-2 text-red-400 text-sm">
                                                ❌ {bulkResult.error}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Section */}
            {!result && !bulkResults.length && (
                <div className="max-w-3xl mx-auto">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Supported Link Formats</h3>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                <code className="text-sm bg-slate-900 px-2 py-1 rounded">
                                    https://www.youtube.com/watch?v=VIDEO_ID
                                </code>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                <code className="text-sm bg-slate-900 px-2 py-1 rounded">https://youtu.be/VIDEO_ID</code>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                <code className="text-sm bg-slate-900 px-2 py-1 rounded">
                                    https://www.youtube.com/embed/VIDEO_ID
                                </code>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                <code className="text-sm bg-slate-900 px-2 py-1 rounded">VIDEO_ID (10-11 characters)</code>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
