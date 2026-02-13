/**
 * Custom API endpoint to fetch article content from RSSHub
 * Route: GET /content/{source}/{contentType}
 *
 * source: the content source (e.g., "gjw")
 * contentType: the type of content (e.g., "article", "video")
 * channelId: the unique identifier of the content channel (passed as query parameter)
 * startKey: pagination key for fetching next set of items (optional, passed as query parameter)
 * pageSize: number of items to fetch per page (optional, passed as query parameter)
 * example request: GET /content/gjw/article?channelId=123&startKey=abc&pageSize=10
 *
 * This endpoint acts as a proxy to fetch a list of content items from source based on channel ID.
 * It retrieves the content based on the channel ID and returns it in a standardized JSON format.
 */

routerAdd("GET", "/content/{source}/{contentType}", (c) => {
  // Helper: Decode byte array to UTF-8 string
  function decodeUtf8(bytes) {
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder("utf-8").decode(Uint8Array.from(bytes));
    }
    const latin1 = String.fromCharCode.apply(null, bytes);
    try {
      return decodeURIComponent(escape(latin1));
    } catch (_) {
      return latin1;
    }
  }

  // Helper: Build upstream URL
  function buildUpstreamUrl(
    source,
    contentType,
    channelId,
    startKey,
    pageSize,
  ) {
    let baseUrl = "";
    if (source === "gjw") {
      baseUrl =
        "https://gw.ganjingworld.com/v1.1/content/get-by-channel?lang=zh-CN";
    } else {
      return null;
    }
    if (contentType === "article") {
      baseUrl += `&channel_id=${channelId}&content_type=News`;
    } else if (contentType === "video") {
      baseUrl += `&channel_id=${channelId}&content_type=Video`;
    } else {
      return null;
    }
    if (startKey) baseUrl += `&start_key=${startKey}`;
    if (pageSize) baseUrl += `&page_size=${pageSize}`;
    return baseUrl;
  }
  try {
    // Extract and validate parameters
    const source = c.request.pathValue("source");
    const query = c.request.url.query();
    const contentType = c.request.pathValue("contentType") || null;
    const channelId = query.get("channelId") || null;
    const startKey = query.get("startKey") || null;
    const pageSize = query.get("pageSize") || null;

    if (!source || typeof source !== "string") {
      return c.json(400, { message: "Missing source collection" });
    }
    if (!contentType || typeof contentType !== "string") {
      return c.json(400, { message: "Missing content type" });
    }

    // Build upstream URL
    const upstreamUrl = buildUpstreamUrl(
      source,
      contentType,
      channelId,
      startKey,
      pageSize,
    );
    if (!upstreamUrl) {
      return c.json(400, {
        message: "Unsupported source collection or content type",
      });
    }

    // Fetch content from upstream
    let res;
    try {
      res = $http.send({
        url: upstreamUrl,
        method: "GET",
        timeout: 15,
        headers: { Accept: "application/json" },
      });
    } catch (e) {
      console.log("[ERROR] Upstream request failed:", e);
      return c.json(502, { message: "Upstream unavailable" });
    }

    if (res.statusCode >= 400) {
      console.log(`[ERROR] Upstream error: ${res.statusCode}`);
      return c.json(502, { message: "Upstream error", status: res.statusCode });
    }

    // Parse response body
    let payload;
    try {
      const bodyText = Array.isArray(res.body)
        ? decodeUtf8(res.body)
        : String(res.body);
      payload = JSON.parse(bodyText);
    } catch {
      console.log("[ERROR] Failed to parse upstream JSON");
      return c.json(500, { message: "Upstream returned invalid JSON" });
    }

    // Safely extract channel info and items (ES5-compatible guards)
    const dataSection = payload && payload.data ? payload.data : {};
    const list = Array.isArray(dataSection.list) ? dataSection.list : [];
    const firstItem = list.length > 0 ? list[0] : null;
    const channel = firstItem && firstItem.channel ? firstItem.channel : {};
    const channelName = channel.name || null;
    const channelIcon = channel.icon || null;
    const nextStartKey = dataSection.start_key || null;

    const items = list.map((item) => ({
      title: item.title,
      id: item.id,
      pubDate: new Date(item.time_scheduled),
      duration: item.duration || 0,
      imageUrl: item.poster_url || item.image_auto_url || "",
      categoryId: item.category_id || "",
    }));

    // Structure response
    const data = {
      id: channelId,
      name: channelName,
      image: channelIcon,
      items,
      nextStartKey,
    };

    return c.json(200, data);
  } catch (e) {
    console.log("[ERROR] Handler crashed:", e);
    return c.json(500, { message: "Internal error" });
  }
});
