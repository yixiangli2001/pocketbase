// url examples: https://gw.ganjingworld.com/v3/content/get-tag-contents/tag_1697905250162_video?start_key=&lang=zh-CN for video,
// https://gw.ganjingworld.com/v3/content/get-tag-contents/tag_1697905250162_article?start_key=&lang=zh-CN for article
// write a pb hook similar to get_data_list.pb.js to get data list by tag from gjw, and use the above tag map to convert tag id to tag name in the output




/**
 * Custom API endpoint to fetch article/video content from GJW by tag
 * Route: GET /tag/{tagId}/{contentType}
 *
 * tagId: the tag identifier (e.g., "tag_1697905250162")
 * contentType: the type of content (e.g., "article", "video")
 * startKey: pagination key for fetching next set of items (optional, passed as query parameter)
 * pageSize: number of items to fetch per page (optional, passed as query parameter)
 * example request: GET /tag/tag_1697905250162/video?startKey=abc&pageSize=10
 *
 * This endpoint acts as a proxy to fetch a list of content items from GJW based on tag ID.
 * It retrieves the content based on the tag ID and returns it in a standardized JSON format.
 */

routerAdd("GET", "/tag/{tagId}/{contentType}", (c) => {
  const tagMap = {
  "tag_1697905250162": "服装",
  "tag_1697905290426": "历史",
  "tag_1697905294541": "文化",
  "tag_1697905370187": "宠物",
  "tag_1697905379471": "医疗",
  "tag_1697905393067": "热门话题",
  "tag_1697905430335": "飞机",
  "tag_1697905987649": "宗教",
  "tag_1697906091857": "移民",
  "tag_1697906124944": "农业",
  "tag_1697906201893": "园艺",
  "tag_1697906902709": "美术",
  "tag_1698329175114": "术学",
  "tag_1698329191714": "法律",
  "tag_1698329214846": "武术",
  "tag_1698329453401": "名人大全",
  "tag_1703282415438": "理财",
  "tag_1706820241194": "文学",
  "tag_1710354000789": "主要媒体",
  "tag_1718117708014": "干净校园",
  "tag_1725925141658": "神韵",
  "tag_1725925339734": "神秘现象",
  "tag_1725925751446": "电影电视剧",
  "tag_1725925828253": "房屋建筑",
  "tag_1725926190878": "科技",
  "tag_1725926286056": "自然",
  "tag_1725926364190": "工业技术",
  "tag_1725926443190": "职业",
  "tag_1727195455620": "干净独家",
  "tag_1730207237866": "学科",
  "tag_1730994407373": "用户指南",
  "tag_1750108838279": "焦点新闻",
  "tag_1750255840270": "文章",
  "tag_1766256482041": "美容",
  "tag_zh-TW_cat14": "儿童",
  "tag_zh-TW_cat15": "生活",
  "tag_zh-TW_cat16": "军事",
  "tag_zh-TW_cat17": "现代音乐",
  "tag_zh-TW_cat19": "自媒体",
  "tag_zh-TW_cat25": "运动",
  "tag_zh-TW_cat27": "旅游",
  "tag_zh-TW_cat3": "汽车",
  "tag_zh-TW_cat30": "舞蹈",
  "tag_zh-TW_cat32": "新闻",
  "tag_zh-TW_cat34": "传统音乐",
  "tag_zh-TW_cat7": "教育",
  "tag_zh-TW_cat9": "美食"
};

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
  function buildUpstreamUrl(tagId, contentType, startKey, pageSize) {
    const baseUrl = "https://gw.ganjingworld.com/v3/content/get-tag-contents/";
    
    let url = baseUrl + tagId + "_" + contentType + "?lang=zh-CN";
    
    if (startKey) url += `&start_key=${startKey}`;
    if (pageSize) url += `&page_size=${pageSize}`;
    
    return url;
  }

  try {
    // Extract and validate parameters
    const tagId = c.request.pathValue("tagId");
    const contentType = c.request.pathValue("contentType");
    const query = c.request.url.query();
    const startKey = query.get("startKey") || "";
    const pageSize = query.get("pageSize") || null;

    if (!tagId || typeof tagId !== "string") {
      return c.json(400, { message: "Missing tag ID" });
    }
    if (!contentType || typeof contentType !== "string") {
      return c.json(400, { message: "Missing content type" });
    }
    if (contentType !== "article" && contentType !== "video") {
      return c.json(400, { message: "Content type must be 'article' or 'video'" });
    }

    // Get tag name from map
    const tagName = tagMap[tagId] || tagId;

    // Build upstream URL
    const upstreamUrl = buildUpstreamUrl(tagId, contentType, startKey, pageSize);

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

    // Safely extract data and items (ES5-compatible guards)
    const dataSection = payload && payload.data ? payload.data : {};
    const list = Array.isArray(dataSection.list) ? dataSection.list : [];
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
      id: tagId,
      name: tagName,
      contentType: contentType,
      items,
      nextStartKey,
    };

    return c.json(200, data);
  } catch (e) {
    console.log("[ERROR] Handler crashed:", e);
    return c.json(500, { message: "Internal error" });
  }
});