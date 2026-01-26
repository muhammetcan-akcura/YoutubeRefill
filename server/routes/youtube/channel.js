import express from "express";
import axios from "axios";

const router = express.Router();

// YouTube API key rotation
const YOUTUBE_API_KEYS = [
   'AIzaSyCGha7oph_qrLmiAM9oMEpfnZq1KSZkx8A',
  'AIzaSyC5c78i_vF6WOVPuo23szwKwsoJ_dNPNmc',
  'AIzaSyDHon6k7sG3zLoTMX8UpddKWMAo8b4xMy0',
  "AIzaSyDiH0OB2pZ2LyO8AVFk9m-dexWcK06ql8k",
  "AIzaSyD7xp0_6JE2SxkU_sI9-JzfeDIg1VDs4mQ",
  'AIzaSyByxoy4jttg3hQAP-eKEBTFnihnYaLMcMo',
  'AIzaSyDjWHNF12d3czuxStB0A62oyy9-DA-WzB0',
  'AIzaSyDSQtvF83MmJRML2wAIJm27CbU8-Rn6uiQ',
  'AIzaSyB7l7SoOq7Wxe5QfPP1PH4ZgKI57C2_iXI',
  'AIzaSyBgltJn92-T3ZlFCOoYklcHLZKW_7Wru8A',
  'AIzaSyDV0NEOodg0b55bp-HctMYuDWmIFq318K8',
  'AIzaSyBlNj54R7YYNwco8hbV_njjxLR3uLkKMGA',
  'AIzaSyD-py3Wl5kn3UPZ0VRgU-2Da9XH0S5mHRs',
  'AIzaSyBtBIXjPHa3UnZ1mS5igeycAHbrOfZaaDA',
  'AIzaSyC86HtI48jCMFSOw3ib7XjmgvaYibaHYUk',
  'AIzaSyBjBAdDGbN7ttYxC-sdnqV2q1rkUEwdQfc',
  'AIzaSyAWICAwgLbk_v7_dViVUrWFpsDtelR9MlI',
  'AIzaSyBs6gEHzYqTbgBwsIF0jp4-5u8avbSgIsI',
  'AIzaSyCZx-J_9HAcSQfK11jtZgNhLtPEJo45So4',
  'AIzaSyDHwNa98-72PVX3Na6RspoRD_37SGYD4aA',
  'AIzaSyD72-jizQXlJ7PavtY2bH2ps7ZeJlTc5Kg',
  'AIzaSyCxfDQz6PVO8ipOjpX3X_e0eqHIYWCNT4A',
  'AIzaSyBNZvpSwVDponpXOYoOzp_EGRD2nWivXbU',
  'AIzaSyAGGBaKnYrYPnmuBvG4RIYEIzRZFJXMcQw',
  'AIzaSyDjYWY_OwVk69yKHebqAbgDEndgiP9EZ2I',
  'AIzaSyA5nHXcX2vnK3tKMTa3Ev43iUN0CPlYPOE',
  'AIzaSyD7s8QiuGkKGQHa5YPogUXsA4IacmI0XYI',
  'AIzaSyDvKKy04Ab6CGfMsr0ONbpBGpuZ7fjUFQA',
  'AIzaSyD5I0S3Lg7v4d5d8whVFNkE9tF5ZQwpwGE',
  'AIzaSyA0lyBq3iI8iHdUYqmnLM5tySAdininXpg',
  'AIzaSyAaSsqC4SBHWj0dlAfoUOw441cCYtGKjtI',
  'AIzaSyCVRzIRARlDK4xZuuIyh7qhNDZQrJKo_Tc',
  'AIzaSyAqtVti5D_eGiLBN5kgyCFfK8b7rDu2uFk',
  'AIzaSyD9uzWM-OUV7CmGkXMQWSZbEBzbVjyxVDo',
  'AIzaSyB91CcbdV5VWOvT0SScP7vy_N3ahueAja8',
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
