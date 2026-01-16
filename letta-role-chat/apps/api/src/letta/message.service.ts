
import { Response } from "express";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

export const messageService = {
  async sendMessageStream(agentId: string, text: string, res: Response) {
    // SSE headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    try {
      const baseUrl = normalizeBaseUrl(process.env.LETTA_BASE_URL || "https://api.letta.com");
      const apiKey = process.env.LETTA_API_KEY;

      // Letta 官方 streaming 端点：/v1/agents/{agent_id}/messages/stream [1](https://docs.letta.com/guides/ade/desktop)[2](https://hub.docker.com/r/letta/letta)
      const url = `${baseUrl}/v1/agents/${agentId}/messages/stream`;

      const upstream = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          stream_tokens: true, // token 级流式（更像 ChatGPT）[1](https://docs.letta.com/guides/ade/desktop)
        }),
      });

      if (!upstream.ok || !upstream.body) {
        const errText = await upstream.text().catch(() => "");
        res.write(`data: ${JSON.stringify({ error: "Upstream error", detail: errText })}\n\n`);
        return res.end();
      }

      // 关键：把 Letta 返回的 SSE 字节流原样转发给前端
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }

      res.end();
    } catch (error: any) {
      console.error("Streaming error:", error);
      res.write(`data: ${JSON.stringify({ error: "Failed to fetch stream" })}\n\n`);
      res.end();
    }
  },
};
