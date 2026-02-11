/**
 * Custom API endpoint to fetch article content from RSSHub
 * Route: GET /content/{source}/{id}
 *
 * source: the content source (e.g., "gjw")
 * contentType: the type of content (e.g., "article")
 * contentId: the unique identifier of the content item
 * example request: GET /content/gjw/article/123
 *
 * This endpoint acts as a proxy to fetch a specific content item from source.
 * It retrieves the content based on the content ID and returns it in a standardized JSON format.
 */

routerAdd("GET", "/content/{source}/{contentType}/{contentId}", (c) => {
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
  function buildUpstreamUrl(source, contentType, contentId) {
    let baseUrl = "";
    if (source === "gjw") {
      baseUrl = "https://gw.ganjingworld.com/v1.1/content/query?lang=zh-TW";
    } else {
      return null;
    }
    if (contentType === "article") {
      baseUrl += `&query=basic%2Cfull%2Ctranslations%2Clike%2Cshare%2Csave%2Cview%2Ctag_list&ids=${contentId}`;
    } else {
      return null;
    }
    return baseUrl;
  }

  try {
    // Extract path parameters from the request
    const contentId = c.request.pathValue("contentId");
    const source = c.request.pathValue("source");
    const contentType = c.request.pathValue("contentType");

    // Validate parameters
    if (!contentId || typeof contentId !== "string") {
      return c.response.status(400).send({ error: "Invalid contentId" });
    }
    if (!source || typeof source !== "string") {
      return c.response.status(400).send({ error: "Invalid source" });
    }
    if (!contentType || typeof contentType !== "string") {
      return c.response.status(400).send({ error: "Invalid contentType" });
    }

    // Build upstream URL
    const upstreamUrl = buildUpstreamUrl(source, contentType, contentId);
    console.log("[INFO] Fetching content from upstream URL:", upstreamUrl);
    if (!upstreamUrl) {
      return c.json(400, {
        message: "Unsupported source collection or content type",
      });
    }
    // Fetch content from RSSHub with 15-second timeout
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

    // Check for upstream errors
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
    if (list.length === 0) {
      return c.json(404, { message: "Content not found" });
    }
    const item = list[0];

    // Structure the response data with relevant fields
    const data = {
      id: contentId,
      title: item.title || null,
      content_html: item.text || null,
      pubDate: new Date(item.time_scheduled) || null,
    };

    return c.json(200, data);
  } catch (e) {
    console.log("[ERROR] Handler crashed:", e);
    return c.json(500, { message: "Internal error" });
  }
});
