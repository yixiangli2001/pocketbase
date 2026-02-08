/**
 * Ganjing World (GJW) Articles Sync Cron Job
 * 
 * This cron job runs every minute for testing (change to "0 * * * *" for hourly)
 * and fetches articles from Ganjing World channels via RSSHub.
 */

console.log("[GJW] Cron job file loaded and registered");

cronAdd("sync_gjw_articles", "0 * * * *", () => {
    console.log("[GJW] ===== CRON JOB STARTED =====");
    /**
     * Helper function to extract article ID from Sound of Hope URL
     * @param {string} url - URL like "https://www.ganjingworld.org/news/1i9ihso1e8a6XrH8PtqZgkS7v1cd1c"
     * @returns {string|null} Article ID (e.g., "1i9ihso1e8a6XrH8PtqZgkS7v1cd1c") or null if not found
     */
    function extractArticleId(url) {
      if (!url) return null;
      
      // Match pattern: /news/1i9ihso1e8a6XrH8PtqZgkS7v1cd1c or /news/1i9ihso1e8a6XrH8PtqZgkS7v1cd1c/anything
      const match = url.match(/\/news\/([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    }

    /**
     * Helper function to convert date string to ISO format
     * @param {string} v - Date string to convert
     * @returns {string|null} ISO formatted date string or null if invalid
     */
    function toIso(v) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }

    //get all channels from gjw_channels collection
    console.log("[GJW] Fetching channels from database...");
    let channelRecords = [];
    try {
      channelRecords = $app.findRecordsByFilter("gjw_channels", "isActive = true", "-created", 500);
      console.log(`[GJW] Found ${channelRecords.length} channels to sync`);
    } catch (e) {
      console.log("[GJW] Failed to fetch channels:", e);
      return;
    }
    
    if (channelRecords.length === 0) {
      console.log("[GJW] no channels found to sync.");
      return;
    }

    const COLLECTION = "gjw_articles";

    // Process each channel separately
    for (const channelRecord of channelRecords) {
      const channel = channelRecord.get("channelId");
      const channelRecordId = channelRecord.id; // PocketBase record ID for the relation
      
      // RSSHub endpoint for this specific channel
      const FEED_URL = "http://localhost:1200/ganjingworld/channel/articles/" + channel + "?format=json";

      try {
        console.log(`[GWJ] syncing articles from channel ${channel}...`);
        
        // Fetch RSS feed from RSSHub with 2 minute timeout
        const res = $http.send({ method: "GET", url: FEED_URL, timeout: 120 });
        
        // Check for HTTP errors
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.log(`[GWJ] channel ${channel} HTTP`, res.statusCode, res.raw);
          continue; // Skip to next channel if this one fails
        }

        // Extract items from RSS feed response
        const items = (res.json && res.json.items) ? res.json.items : [];
        console.log(`[GWJ] channel ${channel} fetched ${items.length} items`);

        // Process each article in the feed
        for (const item of items) {
          const id = item.id || "";
          const sourceUrl = item.url || "";
          const title = item.title || "";
          // const content = item.content_html || "";
          const datePublished = item.date_published;

          // Skip items without required fields
          if (!sourceUrl || !datePublished) continue;

          // Extract article ID from URL (e.g., "1i9ihso1e8a6XrH8PtqZgkS7v1cd1c" from "https://www.ganjingworld.org/news/1i9ihso1e8a6XrH8PtqZgkS7v1cd1c")
          const articleId = extractArticleId(sourceUrl);
          if (!articleId) {
            console.log(`[GWJ] channel ${channel} cannot extract articleId from:`, sourceUrl);
            continue;
          }

          // Upsert logic: Check if article already exists by articleId
          let record = null;
          try {
            record = $app.findFirstRecordByFilter(COLLECTION, "articleId = {:v}", { v: articleId });
          } catch (_) {
            // Record doesn't exist, will create new one below
          }

          // Create new record if it doesn't exist
          if (!record) {
            const collection = $app.findCollectionByNameOrId(COLLECTION);
            record = new Record(collection);
            record.set("articleId", articleId);
          }
          // Update record fields
          record.set("title", title);
          record.set("channel", channelRecordId); // Use PocketBase record ID, not channelId
          // record.set("content", content);
          record.set("sourceUrl", sourceUrl);
          record.set("pubDate", toIso(datePublished));

          // Save the record to database
          try {
            $app.save(record);
          } catch (e) {
            console.log(`[GWJ] channel ${channel} save failed:`, articleId, e);
          }
        }
      } catch (e) {
        // Log errors but continue processing other channels
        console.log(`[GWJ] channel ${channel} job crashed:`, e);
      }
    }
});
