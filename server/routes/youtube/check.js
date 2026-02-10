import express from "express";
import axios from "axios";

const router = express.Router();

// YouTube video ID çıkarma fonksiyonu
function extractVideoId(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{10,11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{10,11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{10,11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{10,11})/,
        /^([a-zA-Z0-9_-]{10,11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

// YouTube API key rotation
const YOUTUBE_API_KEYS = [
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
        return null;
    }
    return YOUTUBE_API_KEYS[currentApiKeyIndex];
}

// YouTube video bilgilerini ve erişilebilirliğini kontrol et
async function checkYouTubeVideo(videoId) {
    try {
        const apiKey = getNextApiKey();
        if (!apiKey) {
            return {
                success: false,
                videoId,
                accessible: false,
                error: "All API keys exhausted",
                errorReason: "api_error",
                status: 500
            };
        }

        // YouTube Data API ile detaylı bilgi al
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails,snippet&id=${videoId}&key=${apiKey}`;

        const response = await axios.get(apiUrl, {
            timeout: 10000,
            validateStatus: (status) => status < 500
        });

        // Quota exceeded durumu
        if (response.status === 403) {
            const errorData = response.data;
            if (errorData?.error?.errors?.some(e => e.reason === 'quotaExceeded')) {
                currentApiKeyIndex++;
                return checkYouTubeVideo(videoId); // Retry with next key
            }
        }

        // Video bulunamadı
        if (response.status === 404 || !response.data?.items || response.data.items.length === 0) {
            // oEmbed fallback dene
            try {
                const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
                const oembedRes = await axios.get(oembedUrl, { validateStatus: () => true });

                if (oembedRes.status === 404) {
                    return {
                        success: false,
                        videoId,
                        accessible: false,
                        error: "Video not found or deleted",
                        errorReason: "not_found",
                        status: 404
                    };
                } else if (oembedRes.status === 401 || oembedRes.status === 403) {
                    return {
                        success: false,
                        videoId,
                        accessible: false,
                        error: "Embedding disabled or private video",
                        errorReason: "embedding_disabled",
                        status: oembedRes.status
                    };
                }
            } catch (e) {
                // oEmbed de başarısız
            }

            return {
                success: false,
                videoId,
                accessible: false,
                error: "Video not found",
                errorReason: "not_found",
                status: 404
            };
        }

        // Video metadata'sı var
        const item = response.data.items[0];
        const status = item.status || {};
        const contentDetails = item.contentDetails || {};
        const snippet = item.snippet || {};

        // Önemli bayraklar
        const embeddable = status.embeddable === true;
        const privacyStatus = status.privacyStatus || 'unknown';
        const uploadStatus = status.uploadStatus || 'unknown';
        const ageRestricted = contentDetails?.contentRating?.ytRating === 'ytAgeRestricted' || false;
        const madeForKids = status.madeForKids === true;
        const licensedContent = contentDetails?.licensedContent === true;

        // Region restriction kontrolü
        const regionRestriction = contentDetails?.regionRestriction || null;
        const hasRegionRestriction = regionRestriction !== null;
        const blockedCountries = regionRestriction?.blocked || [];
        const allowedCountries = regionRestriction?.allowed || [];
        const isRegionBlocked = blockedCountries.length > 0 || (allowedCountries.length > 0);

        // oEmbed kontrolü
        let oembedOk = false;
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const oembedRes = await axios.get(oembedUrl, { validateStatus: () => true });
            oembedOk = oembedRes.status === 200;
        } catch (e) {
            oembedOk = false;
        }

        // Problemleri tespit et
        const problems = [];
        if (privacyStatus !== 'public') problems.push('privacy');
        if (!embeddable) problems.push('embedding_disabled');
        if (ageRestricted) problems.push('age_restricted');
        if (madeForKids) problems.push('made_for_kids');
        if (uploadStatus !== 'processed') problems.push('not_processed');
        if (isRegionBlocked) problems.push('region_restricted');

        // Hata kodu belirle
        let errorCode = null;
        let errorMessage = null;

        if (problems.length > 0) {
            if (problems.includes('privacy')) {
                errorCode = 'video_private';
                errorMessage = 'Video is private or unlisted';
            } else if (problems.includes('region_restricted')) {
                errorCode = 'region_restricted';
                if (blockedCountries.length > 0) {
                    errorMessage = `Video is blocked in ${blockedCountries.length} countries: ${blockedCountries.slice(0, 5).join(', ')}${blockedCountries.length > 5 ? '...' : ''}`;
                } else if (allowedCountries.length > 0) {
                    errorMessage = `Video is only available in ${allowedCountries.length} countries: ${allowedCountries.slice(0, 5).join(', ')}${allowedCountries.length > 5 ? '...' : ''}`;
                } else {
                    errorMessage = 'Video has region restrictions';
                }
            } else if (problems.includes('age_restricted')) {
                errorCode = 'age_restricted';
                errorMessage = 'Video is age restricted';
            } else if (problems.includes('embedding_disabled')) {
                errorCode = 'embedding_disabled';
                errorMessage = 'Embedding is disabled for this video';
            } else if (problems.includes('made_for_kids')) {
                errorCode = 'made_for_kids';
                errorMessage = 'Video is made for kids (embedding restrictions)';
            }
            // playback_restricted hatası kaldırıldı - diğer problemler ignore edilecek
        }

        // Erişilebilir mi?
        const accessible = !errorCode && oembedOk && privacyStatus === 'public';

        if (accessible) {
            return {
                success: true,
                videoId,
                title: snippet.title || "Unknown",
                author: snippet.channelTitle || "Unknown",
                thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || null,
                embedAllowed: embeddable,
                accessible: true,
                privacyStatus,
                ageRestricted,
                madeForKids,
                uploadStatus,
                regionRestriction: hasRegionRestriction ? {
                    blocked: blockedCountries,
                    allowed: allowedCountries
                } : null,
                status: 200
            };
        } else {
            return {
                success: false,
                videoId,
                title: snippet.title || null,
                author: snippet.channelTitle || null,
                thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || null,
                accessible: false,
                error: errorMessage || "Video not accessible",
                errorReason: errorCode || "not_accessible",
                embeddable,
                privacyStatus,
                ageRestricted,
                madeForKids,
                regionRestriction: hasRegionRestriction ? {
                    blocked: blockedCountries,
                    allowed: allowedCountries
                } : null,
                problems,
                status: 403
            };
        }
    } catch (err) {
        console.error('YouTube API error:', err.message);

        if (err.response?.status === 404) {
            return {
                success: false,
                videoId,
                accessible: false,
                error: "Video not found",
                errorReason: "not_found",
                status: 404
            };
        } else if (err.response?.status === 400) {
            return {
                success: false,
                videoId,
                accessible: false,
                error: "Invalid video ID or video not found",
                errorReason: "not_found",
                status: 400
            };
        } else if (err.response?.status === 401 || err.response?.status === 403) {
            return {
                success: false,
                videoId,
                accessible: false,
                error: "Embedding disabled or private video",
                errorReason: "embedding_disabled",
                status: err.response.status
            };
        } else {
            return {
                success: false,
                videoId,
                accessible: false,
                error: err.message || "API error",
                errorReason: "api_error",
                status: err.response?.status || 500
            };
        }
    }
};

// API endpoint
router.post("/api/youtube/check", async (req, res) => {
    const { link } = req.body;

    if (!link) {
        return res.status(400).json({
            success: false,
            error: "YouTube link is required"
        });
    }

    try {
        const videoId = extractVideoId(link);

        if (!videoId) {
            return res.status(400).json({
                success: false,
                error: "Invalid YouTube URL format",
                errorReason: "invalid_url"
            });
        }

        const result = await checkYouTubeVideo(videoId);

        return res.json(result);
    } catch (err) {
        console.error("YouTube check API error:", err.message);
        return res.status(500).json({
            success: false,
            error: "Server error",
            errorReason: "server_error"
        });
    }
});

export default router;
