export default async function handler(req, res) {
  try {
    const { method, url, headers, body } = req;

    // 从查询参数里获取路径，比如 /api/proxy?path=/chat/completions
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const path = searchParams.get("path");
    if (!path) {
      return res.status(400).json({ error: "Missing 'path' query parameter" });
    }

    // 拼接 OpenAI API 完整 URL
    const apiUrl = `https://api.openai.com/v1${path}`;

    // 转发请求
    const response = await fetch(apiUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: method === "GET" ? undefined : JSON.stringify(body),
    });

    // 保持原样返回结果
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
