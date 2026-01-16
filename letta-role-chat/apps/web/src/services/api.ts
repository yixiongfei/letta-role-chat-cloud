const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const api = {
  async getRoles() {
    const res = await fetch(`${API_BASE_URL}/roles`);
    return res.json();
  },

  async createRole(role: { name: string; persona: string; human: string }) {
    const res = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(role),
    });
    return res.json();
  },

  // 流式消息发送
  async sendMessageStream(roleId: string, message: string, onChunk: (chunk: string) => void) {
    const response = await fetch(`${API_BASE_URL}/messages/${roleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch (e) {
            console.error('Error parsing SSE data', e);
          }
        }
      }
    }
  }
};
