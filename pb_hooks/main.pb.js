/**
 * Custom API endpoint to fetch article content from RSSHub
 * Route: GET /content/{sourceCollection}/{id}
 * 
 * This endpoint acts as a proxy to fetch full article content from a local RSSHub instance.
 * It retrieves the content based on the article ID and returns it in a standardized JSON format.
 */


  routerAdd("GET", "/content/{sourceCollection}/{id}", (c) => {
    try {
      // Extract path parameters from the request
      const contentId = c.request.pathValue("id")
      const sourceCollection = c.request.pathValue("sourceCollection")

      // Validate required parameters
      if (!contentId || typeof contentId !== "string") {
        return c.json(400, { message: "Missing article id" })
      }
      if (!sourceCollection || typeof sourceCollection !== "string") {
        return c.json(400, { message: "Missing source collection" })
      }

      // Build upstream URL to fetch content from local RSSHub instance
      const upstreamUrl =
        `http://localhost:1200/ganjingworld/article/${encodeURIComponent(contentId)}?format=json`

      // Fetch content from RSSHub with 15-second timeout
      let res
      try {
        res = $http.send({
          url: upstreamUrl,
          method: "GET",
          timeout: 15,
          headers: { "Accept": "application/json" },
        })
      } catch (e) {
        console.log("[ERROR] Upstream request failed:", e);
        return c.json(502, { message: "Upstream unavailable" })
      }

      // Check for upstream errors
      if (res.statusCode >= 400) {
        console.log(`[ERROR] Upstream error: ${res.statusCode}`);
        return c.json(502, { message: "Upstream error", status: res.statusCode })
      }

      // Parse the response body
      let payload
      try {
        // Handle byte array responses by converting to UTF-8 string
        const bodyText = Array.isArray(res.body)
          ? (function decodeUtf8(bytes) {
              // Use native TextDecoder if available
              if (typeof TextDecoder !== "undefined") {
                console.log("Using TextDecoder to decode bytes")
                return new TextDecoder("utf-8").decode(Uint8Array.from(bytes))
              }
              // Fallback: convert bytes to Latin-1, then decode as UTF-8
              const latin1 = String.fromCharCode.apply(null, bytes)
              try {
                console.log("Using fallback to decode bytes as Latin-1")
                return decodeURIComponent(escape(latin1))
              } catch (_) {
                return latin1
              }
            })(res.body)
          : String(res.body)

        payload = JSON.parse(bodyText)
      } catch {
        console.log("[ERROR] Failed to parse upstream JSON");
        return c.json(500, { message: "Upstream returned invalid JSON" })
      }

      // Extract the first item from the payload (RSSHub returns items array)
      const item = Array.isArray(payload.items) && payload.items.length > 0
        ? payload.items[0]
        : payload

      // Structure the response data with relevant fields
      const data = {
        id: contentId,
        title: item.title || null,
        content_html: item.content_html || null,
        date_published: item.date_published || null,
      }

      return c.json(200, data)
    } catch (e) {
      console.log("[ERROR] Handler crashed:", e)
      return c.json(500, { message: "Internal error" })
    }
  })
