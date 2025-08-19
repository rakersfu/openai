export default async function handler(req, res) {
  try {
    const { method, url } = req;

    // 从 /api/... 提取路径，比如 /api/chat/completions → /chat/completions
    const apiPath = url.replace(/^\/api/, "");

    if (!apiPath || apiPath === "/") {
      return res.status(400).json({ error: "Missing API path" });
    }

    // 解析请求体（POST/PUT）
    let body;
    if (method !== "GET") {
      body = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => {
          try {
            resolve(JSON.parse(data || "{}"));
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    // 转发到 OpenAI
    const response = await fetch(`https://api.openai.com/v1${apiPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: method === "GET" ? undefined : JSON.stringify(body),
    });

    // 原样返回
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

