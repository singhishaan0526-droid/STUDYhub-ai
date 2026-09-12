import authService from './authService';

const API = import.meta.env.VITE_API_URL;
const BASE = `${API}/api/doubts`;

const doubtsService = {
  askDoubtStream: async (query, history = [], media = null, onChunk, onComplete, onError) => {
    try {
      const response = await fetch(`${BASE}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authService.getCurrentUser()?.token}`,
        },
        body: JSON.stringify({ query, history, media }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.replace(/^data:\s*/, '').trim();
          if (!json) continue;
          try {
            const parsed = JSON.parse(json);
            if (parsed.error)      { onError?.(parsed.error); return; }
            else if (parsed.done)  { onComplete?.(); return; }
            else if (parsed.text)  { onChunk?.(parsed.text); }
          } catch (e) {
            console.error('SSE parse error:', e);
          }
        }
      }
      onComplete?.();
    } catch (err) {
      if (onError) onError(err.message || 'Stream error');
      else throw err;
    }
  },
};

export default doubtsService;
