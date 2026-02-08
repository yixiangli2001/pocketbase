// /**
//  * Helper function to extract twitter post ID from Twitter URL
//  * @param {string} url - URL like "https://x.com/elonmusk/status/2017075618626884045"
//  * @returns {string|null} twitter post ID (e.g., "2017075618626884045") or null if not found
//  */
// cronAdd("sync_twitter_user_posts", "0 * * * *", () => {
//     /**
//      * Helper function to extract twitter post ID from Twitter URL
//      * @param {string} url - URL like https://x.com/elonmusk/status/2017075618626884045
//      * @returns {string|null} twitter post ID (e.g., "2017075618626884045") or null if not found
//      */
//     function extractPostId(url) {
//       if (!url) return null;
      
//       // Match pattern: /status/1234567890123456789 or /status/1234567890123456789/anything
//       const match = url.match(/\/status\/(\d+)/);
//       return match ? match[1] : null;
//     }

//     /**
//      * Helper function to convert date string to ISO format
//      * @param {string} v - Date string to convert
//      * @returns {string|null} ISO formatted date string or null if invalid
//      */
//     function toIso(v) {
//       const d = new Date(v);
//       return isNaN(d.getTime()) ? null : d.toISOString();
//     }

//     // List of Twitter user IDs to sync
//     const users = ["elonmusk", "realDonaldTrump","spacex"]; 
//     const COLLECTION = "twitter_user_posts";

//     // Process each user separately
//     for (const userId of users) {
//       // RSSHub endpoint for this specific user
//       const FEED_URL = "http://localhost:1200/twitter/user/" + userId + "?format=json";

//       try {
//         console.log(`[Twitter] syncing user ${userId}...`);
        
//         // Fetch RSS feed from RSSHub with 2 minute timeout
//         const res = $http.send({ method: "GET", url: FEED_URL, timeout: 120 });
        
//         // Check for HTTP errors
//         if (res.statusCode < 200 || res.statusCode >= 300) {
//           console.log(`[Twitter] user ${userId} HTTP`, res.statusCode, res.raw);
//           continue; // Skip to next user if this one fails
//         }

//         // Extract items from RSS feed response
//         const items = (res.json && res.json.items) ? res.json.items : [];
//         console.log(`[Twitter] user ${userId} fetched ${items.length} items`);

//         // Process each twitter post in the feed
//         for (const item of items) {
//           const sourceUrl = item.url || "";
//           const title = item.title || "";
//           const content = item.content_html || "";
//           const pubDate = item.date_published || "";
//           const userName = item.authors && item.authors.length > 0 ? item.authors[0].name : "";

//           // Skip items without required fields
//           if (!sourceUrl || !pubDate) {
//             console.log(`[Twitter] user ${userId} skipping item with missing fields:`, sourceUrl, pubDate);
//             continue;
//           }

//           // Extract twitter post ID from URL (e.g., "2017075618626884045" from "https://x.com/elonmusk/status/2017075618626884045")
//           const postId = extractPostId(sourceUrl);
//           if (!postId) {
//             console.log(`[Twitter] user ${userId} cannot extract postId from:`, sourceUrl);
//             continue;
//           }

//           // Upsert logic: Check if twitter post already exists by postId
//           let record = null;
//           try {
//             record = $app.findFirstRecordByFilter(COLLECTION, "postId = {:v}", { v: postId });
//           } catch (_) {
//             // Record doesn't exist, will create new one below
//           }

//           // Create new record if it doesn't exist
//           if (!record) {
//             const collection = $app.findCollectionByNameOrId(COLLECTION);
//             record = new Record(collection);
//             record.set("postId", postId);
//           }

//           // Update record fields
//           record.set("title", title);
//           record.set("content", content);
//           record.set("sourceUrl", sourceUrl);
//           record.set("pubDate", toIso(pubDate));
//           record.set("userId", userId); // Track which user this twitter post belongs to
//           record.set("userName", userName); // Track the twitter user's name

//           // Save the record to database
//           try {
//             $app.save(record);
//           } catch (e) {
//             console.log(`[Twitter] user ${userId} save failed:`, postId, e);
//           }
//         }
//         console.log(`[Twitter] user ${userId} completed processing all items`);

//       } catch (e) {
//         // Log errors but continue processing other users
//         console.log(`[Twitter] user ${userId} job crashed:`, e);
//       }
//     }
// });
