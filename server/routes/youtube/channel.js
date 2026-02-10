import express from "express";
import axios from "axios";

const router = express.Router();

// YouTube API key rotation
const YOUTUBE_API_KEYS = [

  'AIzaSyC3ljEXhxu-8waPit2vvFAZSQ3OmNt7-Vs',
  'AIzaSyDiLEwgYRma0sQRyQpR7PflUf3iDKDX0z8',
  'AIzaSyB0hRpz5GaIlGCdMadCjWR_HU2-kAxMu0E',
  'AIzaSyDuna-iv9Qq934WMVeNwNqnzsAOfji_I70',
  'AIzaSyDPCcaWPPSxmFbEXqOCS2xjxiN_yu5PxyE'
];
let currentApiKeyIndex = 0;

function getNextApiKey() {
    if (currentApiKeyIndex >= YOUTUBE_API_KEYS.length) {
        currentApiKeyIndex = 0; // Reset to first key
    }
    return YOUTUBE_API_KEYS[currentApiKeyIndex];
}

// Extract channel ID from various formats
async function getChannelId(input) {
    const apiKey = getNextApiKey();

    // If it's already a channel ID (starts with UC and 24 chars)
    if (input.match(/^UC[\w-]{22}$/)) {
        return input;
    }

    // If it's a URL, extract username or handle
    let username = input;
    const urlPatterns = [
        /youtube\.com\/@([\w-]+)/,
        /youtube\.com\/c\/([\w-]+)/,
        /youtube\.com\/user\/([\w-]+)/,
        /youtube\.com\/channel\/(UC[\w-]{22})/
    ];

    for (const pattern of urlPatterns) {
        const match = input.match(pattern);
        if (match) {
            if (pattern.source.includes('channel')) {
                return match[1]; // Already a channel ID
            }
            username = match[1];
            break;
        }
    }

    // Search for channel by username/handle
    try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(username)}&key=${apiKey}`;
        const response = await axios.get(searchUrl);

        if (response.data.items && response.data.items.length > 0) {
            return response.data.items[0].snippet.channelId;
        }
    } catch (error) {
        console.error('Error searching for channel:', error.message);
    }

    return null;
}

// Get all videos from a channel
async function getChannelVideos(channelId, maxResults = 50) {
    const apiKey = getNextApiKey();
    const videos = [];
    let nextPageToken = null;

    try {
        do {
            const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=50&type=video${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

            const response = await axios.get(url);

            if (response.data.items) {
                // Get video IDs to fetch durations
                const videoIds = response.data.items.map(item => item.id.videoId);

                // Fetch video details including duration
                const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(',')}&part=contentDetails`;
                const detailsResponse = await axios.get(detailsUrl);

                // Create a map of videoId -> duration
                const durationMap = {};
                if (detailsResponse.data.items) {
                    detailsResponse.data.items.forEach(item => {
                        const duration = item.contentDetails.duration; // ISO 8601 format (PT1M30S)
                        const seconds = parseDuration(duration);
                        durationMap[item.id] = seconds;
                    });
                }

                response.data.items.forEach(item => {
                    const videoId = item.id.videoId;
                    const durationSeconds = durationMap[videoId] || 0;
                    const isShort = durationSeconds > 0 && durationSeconds < 61; // Shorts are under 61 seconds

                    videos.push({
                        videoId: videoId,
                        title: item.snippet.title,
                        publishedAt: item.snippet.publishedAt,
                        thumbnail: item.snippet.thumbnails.default.url,
                        link: isShort ? `https://www.youtube.com/shorts/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`,
                        duration: durationSeconds,
                        isShort: isShort
                    });
                });
            }

            nextPageToken = response.data.nextPageToken;

            // Limit to maxResults
            if (videos.length >= maxResults) {
                break;
            }

        } while (nextPageToken);

        return videos.slice(0, maxResults);
    } catch (error) {
        console.error('Error fetching channel videos:', error.message);
        throw error;
    }
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
}

// API endpoint
router.post("/api/youtube/channel/videos", async (req, res) => {
    const { channel, maxResults = 50 } = req.body;

    if (!channel) {
        return res.status(400).json({
            success: false,
            error: "Channel name or ID is required"
        });
    }

    try {
        // Get channel ID
        const channelId = await getChannelId(channel);

        if (!channelId) {
            return res.status(404).json({
                success: false,
                error: "Channel not found",
                errorReason: "channel_not_found"
            });
        }

        // Get channel info
        const apiKey = getNextApiKey();
        const channelInfoUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
        const channelInfo = await axios.get(channelInfoUrl);

        if (!channelInfo.data.items || channelInfo.data.items.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Channel not found",
                errorReason: "channel_not_found"
            });
        }

        const channelData = channelInfo.data.items[0];

        // Get videos
        const videos = await getChannelVideos(channelId, maxResults);

        return res.json({
            success: true,
            channel: {
                id: channelId,
                title: channelData.snippet.title,
                description: channelData.snippet.description,
                thumbnail: channelData.snippet.thumbnails.default.url,
                subscriberCount: channelData.statistics.subscriberCount,
                videoCount: channelData.statistics.videoCount
            },
            videos,
            totalFetched: videos.length
        });
    } catch (err) {
        console.error("YouTube channel API error:", err.message);

        if (err.response?.status === 403) {
            currentApiKeyIndex++;
            return res.status(503).json({
                success: false,
                error: "API quota exceeded, please try again later",
                errorReason: "quota_exceeded"
            });
        }

        return res.status(500).json({
            success: false,
            error: "Server error",
            errorReason: "server_error"
        });
    }
});

export default router;
