import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { MOCK_VOLUNTEERS } from './lib/mock-data';
import path from 'path';

function getAiClient(req: express.Request) {
  const customKey = req.headers['x-gemini-api-key'] as string;
  if (customKey) {
    return new GoogleGenAI({ apiKey: customKey });
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/parse-task', async (req, res) => {
    try {
      const { rawText } = req.body;
      const ai = getAiClient(req);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Ты парсер. Извлеки из текста пользователя структурированные данные. Верни строго JSON, соответствующий интерфейсу Task. Если данных не хватает, заполни недостающие поля null или пустыми массивами. Текст: "${rawText}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              required_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              required_schedule: { type: Type.ARRAY, items: { type: Type.STRING } },
              category: { type: Type.STRING }
            },
            required: ['title', 'description', 'required_skills', 'required_schedule', 'category']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/match-volunteers', async (req, res) => {
    try {
      const { task } = req.body;
      const ai = getAiClient(req);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Оцени совместимость каждого волонтера с задачей. Для каждого волонтера верни match_score (0-100) и reason (1 короткое предложение, аргументирующее % совпадения на основе навыков/графика). Верни строго JSON массив объектов { volunteerId, match_score, reason }.\n\nЗадача: ${JSON.stringify(task)}\nВолонтеры: ${JSON.stringify(MOCK_VOLUNTEERS)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                volunteerId: { type: Type.STRING },
                match_score: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              },
              required: ['volunteerId', 'match_score', 'reason']
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { taskContext, message, volunteer } = req.body;
      const ai = getAiClient(req);

      const volContext = volunteer ? `Профиль волонтера: ${JSON.stringify(volunteer)}.` : '';

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Ты координатор проекта. Контекст задачи: ${JSON.stringify(taskContext)}. ${volContext} Отвечай на вопрос волонтера ТОЛЬКО опираясь на этот контекст задачи и его профиль. Подскажи, чем именно он может быть полезен, исходя из его навыков. Если ответа в контексте нет, скажи: 'В описании задачи этого нет, я уточню у куратора'. Будь краток, вежлив и обращайся к волонтеру по имени. Ничего не придумывай по условиям задачи.\n\nВопрос: ${message}`,
        config: {
          temperature: 0.1
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();