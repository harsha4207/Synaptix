/**
 * SYNAPTIX COMMAND — Standalone Backend API Server for Render / Production
 *
 * Runs as a native Node.js HTTP service listening on process.env.PORT.
 * Serves server-side Gemini intelligence and ElevenLabs voice proxy.
 */

import * as http from 'http';
import { geminiService } from '../lib/gemini/geminiService.js';

const PORT = parseInt(process.env.PORT || '10000', 10);
const HOST = '0.0.0.0';

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        // 10MB limit
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '';

  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // 2. Health Root (Render Health Check)
  if (req.method === 'GET' && (url === '/' || url === '/health')) {
    sendJson(res, 200, {
      status: 'ok',
      service: 'SYNAPTIX COMMAND Intelligence Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 3. GET /api/health/gemini
  if (req.method === 'GET' && url.startsWith('/api/health/gemini')) {
    try {
      geminiService.initFromEnv();
      const urlObj = new URL(url, 'http://localhost');
      const forcePing = urlObj.searchParams.get('ping') === 'true';
      const health = await geminiService.checkHealth(forcePing);
      sendJson(res, 200, health);
    } catch (err: any) {
      sendJson(res, 500, {
        isConfigured: false,
        model: geminiService.getModelName(),
        status: 'error',
        error: err.message || 'Health check failed',
        lastChecked: new Date().toISOString(),
      });
    }
    return;
  }

  // 4. POST /api/ai/generate
  if (req.method === 'POST' && url === '/api/ai/generate') {
    try {
      const body = await parseJsonBody(req);
      const { prompt, systemInstruction, temperature, maxOutputTokens } = body;
      if (!prompt) {
        sendJson(res, 400, { error: 'prompt is required' });
        return;
      }
      geminiService.initFromEnv();
      const text = await geminiService.generateText(prompt, {
        systemInstruction,
        temperature,
        maxOutputTokens,
      });
      sendJson(res, 200, { text });
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Generation failed' });
    }
    return;
  }

  // 5. POST /api/ai/chat/stream (SSE Streaming)
  if (req.method === 'POST' && url === '/api/ai/chat/stream') {
    try {
      const body = await parseJsonBody(req);
      const { prompt, systemInstruction, temperature } = body;
      if (!prompt) {
        sendJson(res, 400, { error: 'prompt is required' });
        return;
      }

      geminiService.initFromEnv();

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      if (geminiService.isConfigured()) {
        const fullText = await geminiService.generateText(prompt, {
          systemInstruction,
          temperature,
        });

        const words = fullText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          res.write(`data: ${JSON.stringify({ type: 'token', token: chunk })}\n\n`);
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        res.write(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`);
      } else {
        const fallback = `SYNAPTIX COMMAND Intelligence: Response to "${prompt.substring(0, 40)}..." (EMLM Offline Fallback)`;
        res.write(`data: ${JSON.stringify({ type: 'done', fullText: fallback })}\n\n`);
      }
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Stream error' })}\n\n`);
      res.end();
    }
    return;
  }

  // 6. POST /api/ai/rag
  if (req.method === 'POST' && url === '/api/ai/rag') {
    try {
      const body = await parseJsonBody(req);
      const { query, workspaceId, evidenceBlocks } = body;
      if (!query || !workspaceId) {
        sendJson(res, 400, { error: 'query and workspaceId are required' });
        return;
      }
      geminiService.initFromEnv();
      const result = await geminiService.generateGroundedRagAnswer({
        query,
        workspaceId,
        evidenceBlocks: evidenceBlocks || [],
      });
      sendJson(res, 200, result);
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'RAG generation failed' });
    }
    return;
  }

  // 7. POST /api/ai/classify-intent
  if (req.method === 'POST' && url === '/api/ai/classify-intent') {
    try {
      const body = await parseJsonBody(req);
      const { transcript, context } = body;
      if (!transcript) {
        sendJson(res, 400, { error: 'transcript is required' });
        return;
      }
      geminiService.initFromEnv();
      if (geminiService.isConfigured()) {
        const result = await geminiService.classifyVoiceIntent(transcript, context);
        sendJson(res, 200, result);
      } else {
        sendJson(res, 200, {
          intent: 'CONVERSATION_QUERY',
          parameters: { question: transcript },
          confidence: 0.85,
          requiresClarification: false,
          reason: 'Deterministic fallback classification',
          riskLevel: 'LOW',
        });
      }
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Intent classification failed' });
    }
    return;
  }

  // 8. POST /api/ai/dashboard-spec
  if (req.method === 'POST' && url === '/api/ai/dashboard-spec') {
    try {
      const body = await parseJsonBody(req);
      const { prompt, workspaceId } = body;
      if (!prompt) {
        sendJson(res, 400, { error: 'prompt is required' });
        return;
      }
      geminiService.initFromEnv();
      const spec = await geminiService.generateDashboardSpecification(
        prompt,
        workspaceId || 'finance'
      );
      sendJson(res, 200, spec);
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Dashboard generation failed' });
    }
    return;
  }

  // 9. POST /api/voice/tts
  if (req.method === 'POST' && url === '/api/voice/tts') {
    try {
      const body = await parseJsonBody(req);
      const { text, voiceId } = body;
      const elevenKey = process.env.ELEVENLABS_API_KEY?.trim() || '';
      const defaultVoice = process.env.ELEVENLABS_VOICE_ID?.trim() || '21m00Tcm4TlvDq8ikWAM';

      if (!elevenKey || elevenKey.includes('replace_with')) {
        sendJson(res, 200, {
          status: 'unconfigured',
          message: 'ElevenLabs API key not configured. Using client-side Web Speech API.',
          useWebSpeech: true,
        });
        return;
      }

      const targetVoice = voiceId || defaultVoice;
      const elevenRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${targetVoice}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
            },
          }),
        }
      );

      if (!elevenRes.ok) {
        sendJson(res, 200, {
          status: 'provider_error',
          message: `ElevenLabs returned HTTP ${elevenRes.status}`,
          useWebSpeech: true,
        });
        return;
      }

      const audioBuffer = await elevenRes.arrayBuffer();
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength,
        'Access-Control-Allow-Origin': '*',
      });
      res.end(Buffer.from(audioBuffer));
    } catch (err: any) {
      sendJson(res, 200, {
        status: 'error',
        message: err.message || 'TTS generation failed',
        useWebSpeech: true,
      });
    }
    return;
  }

  // Default 404
  sendJson(res, 404, { error: 'Route not found', path: url });
});

server.listen(PORT, HOST, () => {
  geminiService.initFromEnv();
  console.log(`[SYNAPTIX SERVER] Running on http://${HOST}:${PORT}`);
  console.log(`[SYNAPTIX SERVER] Gemini configured: ${geminiService.isConfigured()}`);
});
