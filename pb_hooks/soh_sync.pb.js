/**
 * Helper function to extract article ID from Sound of Hope URL
 * @param {string} url - URL like "https://www.soundofhope.org/post/920278"
 * @returns {string|null} Article ID (e.g., "920278") or null if not found
 */
cronAdd("sync_soh_terms", "0 * * * *", () => {
    /**
     * Helper function to extract article ID from Sound of Hope URL
     * @param {string} url - URL like "https://www.soundofhope.org/post/920278"
     * @returns {string|null} Article ID (e.g., "920278") or null if not found
     */
    function extractArticleId(url) {
      if (!url) return null;
      
      // Match pattern: /post/123456 or /post/123456/anything
      const match = url.match(/\/post\/(\d+)/);
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

    // List of Sound of Hope category/term IDs to sync
    const terms = [1, 5];
    const COLLECTION = "soharticles";

    // Process each term separately
    for (const termId of terms) {
      // RSSHub endpoint for this specific term
      const FEED_URL = "http://localhost:1200/soundofhope/term/" + termId + "?format=json";

      try {
        console.log(`[SOH] syncing term ${termId}...`);
        
        // Fetch RSS feed from RSSHub with 2 minute timeout
        const res = $http.send({ method: "GET", url: FEED_URL, timeout: 120 });
        
        // Check for HTTP errors
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.log(`[SOH] term ${termId} HTTP`, res.statusCode, res.raw);
          continue; // Skip to next term if this one fails
        }

        // Extract items from RSS feed response
        const items = (res.json && res.json.items) ? res.json.items : [];
        console.log(`[SOH] term ${termId} fetched ${items.length} items`);

        // Process each article in the feed
        for (const item of items) {
          const sourceUrl = item.url || "";
          const title = item.title || "";
          const content = item.content_html || "";
          const datePublished = item.date_published;

          // Skip items without required fields
          if (!sourceUrl || !datePublished) continue;

          // Extract article ID from URL (e.g., "920278" from "https://www.soundofhope.org/post/920278")
          const articleId = extractArticleId(sourceUrl);
          if (!articleId) {
            console.log(`[SOH] term ${termId} cannot extract articleId from:`, sourceUrl);
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
          record.set("content", content);
          record.set("sourceUrl", sourceUrl);
          record.set("pubDate", toIso(datePublished));
          record.set("category", termId); // Track which term this article belongs to

          // Save the record to database
          try {
            $app.save(record);
          } catch (e) {
            console.log(`[SOH] term ${termId} save failed:`, articleId, e);
          }
        }
      } catch (e) {
        // Log errors but continue processing other terms
        console.log(`[SOH] term ${termId} job crashed:`, e);
      }
    }
});
