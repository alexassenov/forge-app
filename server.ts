import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    const app = express();
    const PORT = 3000; // Strictly use 3000 as per instructions

    app.use(cors());
    app.use(express.json({ limit: '1mb' }));

    // --- AI Service Logic (Server-Side) ---
    function getAI() {
      // Prioritize API_KEY as it's often the platform-provided key for general use
      const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY || "").trim();
      
      if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
        console.error("CRITICAL: No valid Gemini API key found in server environment variables (tried API_KEY, GEMINI_API_KEY1, GEMINI_API_KEY).");
        return null;
      }
      return new GoogleGenAI({ apiKey });
    }

    const fallbacks = {
      sprint: (highlight: string) => ({
        principle: "Action over Theory",
        challenge: `Apply the core lesson from: "${highlight.substring(0, 50)}..." in one specific action today. Focus on the most immediate, low-friction step you can take to bridge the gap between knowing and doing.`,
        durationDays: 3
      }),
      reflection: (improvement: string) => ({
        challenge: `Focus exclusively on ${improvement || "your core goal"} for the next 24 hours. Set a timer for 15 minutes of deep work every 2 hours to ensure consistent progress.`
      }),
      quote: () => ({
        quote: "DISCIPLINE IS THE ONLY PATH TO FREEDOM. THE FORGE DOES NOT CARE FOR YOUR EXCUSES, ONLY YOUR ACTIONS."
      }),
      gateway: (habit: string) => {
        const h = habit.toLowerCase();
        let gateway = `Start ${habit}`;
        let steps = [
          "Initial setup: Prepare your environment so that starting is the easiest option.",
          "5 minutes of effort: Commit to just 5 minutes. The goal is showing up, not the result.",
          "Consistent practice: Repeat the gateway daily until it becomes an automatic reflex."
        ];

        if (h.includes("run") || h.includes("gym") || h.includes("exercise") || h.includes("workout")) {
          gateway = "Put on your workout gear";
          steps = [
            "Step 1: Walk for 5 minutes. Just get outside or on the treadmill. No pressure to run.",
            "Step 2: 15 minutes of light activity. Increase the intensity slightly, but stay within your comfort zone.",
            "Step 3: Full session. Now that you've built momentum, complete your planned workout with focus."
          ];
        } else if (h.includes("read") || h.includes("study") || h.includes("learn")) {
          gateway = "Open the book or app";
          steps = [
            "Step 1: Read exactly 1 page. The barrier to entry must be so low that you can't say no.",
            "Step 2: Read for 10 minutes. Set a timer. Once it rings, you are free to stop or continue.",
            "Step 3: Complete a chapter. Engage deeply with the material and take one actionable note."
          ];
        } else if (h.includes("write") || h.includes("code") || h.includes("work")) {
          gateway = "Open your workspace and sit down";
          steps = [
            "Step 1: Write one sentence or one line of code. Just break the blank page syndrome.",
            "Step 2: Work for 15 minutes of deep focus. No distractions, no notifications, just the task.",
            "Step 3: Deep work session. Extend your focus to 45-60 minutes for maximum productivity."
          ];
        } else if (h.includes("meditate") || h.includes("breath")) {
          gateway = "Sit down in a quiet spot and close your eyes";
          steps = [
            "Step 1: Take 3 deep, intentional breaths. Focus entirely on the sensation of air moving.",
            "Step 2: 5 minutes of silence. Observe your thoughts without judgment as they pass by.",
            "Step 3: Full meditation. Practice sustained awareness for 10-15 minutes to center yourself."
          ];
        }

        return { gateway, steps };
      }
    };

    // --- API Routes ---
    app.post("/api/ai/sprint", async (req, res) => {
      const { highlight, source } = req.body;
      try {
        const ai = getAI();
        if (!ai) return res.json(fallbacks.sprint(highlight));

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Extract the core actionable principle from this highlight and generate a short-term challenge (1, 3, or 7 days).
          Source: ${source}
          Highlight: "${highlight}"
          Return JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                principle: { type: Type.STRING },
                challenge: { type: Type.STRING },
                durationDays: { type: Type.NUMBER }
              },
              required: ["principle", "challenge", "durationDays"]
            }
          }
        });
        res.json(JSON.parse(response.text));
      } catch (error) {
        console.error("AI Sprint failed:", error);
        res.json(fallbacks.sprint(highlight));
      }
    });

    app.post("/api/ai/reflection", async (req, res) => {
      const { improvement, mistake } = req.body;
      try {
        const ai = getAI();
        if (!ai) return res.json(fallbacks.reflection(improvement));

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate a specific, actionable challenge for tomorrow based on:
          Improvement: "${improvement}"
          Mistake: "${mistake}"
          Return JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                challenge: { type: Type.STRING }
              },
              required: ["challenge"]
            }
          }
        });
        res.json(JSON.parse(response.text));
      } catch (error) {
        console.error("AI Reflection failed:", error);
        res.json(fallbacks.reflection(improvement));
      }
    });

    app.post("/api/ai/parse-bulk", async (req, res) => {
      const { text } = req.body;
      if (!text || text.length < 5) return res.json([]);
      
      const regexHighlights: any[] = [];
      const lines = text.split('\n');
      for (const line of lines) {
        const match = line.match(/"([^"]+)"\s*[—–-]+\s*(.+)/);
        if (match) {
          regexHighlights.push({
            text: match[1].trim(),
            source: match[2].trim()
          });
        }
      }

      if (regexHighlights.length >= 3) {
        return res.json(regexHighlights);
      }

      try {
        const ai = getAI();
        if (!ai) return res.json(regexHighlights);

        const truncatedText = text.substring(0, 10000);
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Parse the following text which contains highlights from books. 
          Extract each individual highlight with its source (book title). 
          Return an array of objects.
          
          Text: \n\n${truncatedText}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  source: { type: Type.STRING }
                },
                required: ["text", "source"]
              }
            }
          }
        });
        
        const aiResults = JSON.parse(response.text || "[]");
        res.json(aiResults.length > 0 ? aiResults : regexHighlights);
      } catch (error) {
        console.error("AI Parse failed:", error);
        res.json(regexHighlights);
      }
    });

    app.post("/api/ai/quote", async (req, res) => {
      const { goals } = req.body;
      try {
        const ai = getAI();
        if (!ai) return res.json(fallbacks.quote());

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate a short, aggressive motivational quote for these goals: ${goals.join(', ')}. 
          Style: "Forge" (minimalist, stoic).
          Return JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                quote: { type: Type.STRING }
              },
              required: ["quote"]
            }
          }
        });
        res.json(JSON.parse(response.text));
      } catch (error) {
        console.error("AI Quote failed:", error);
        res.json(fallbacks.quote());
      }
    });

    app.post("/api/ai/gateway", async (req, res) => {
      const { habit } = req.body;
      try {
        const ai = getAI();
        if (!ai) return res.json(fallbacks.gateway(habit));

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Scale down "${habit}" into a 2-minute "Gateway Habit" and a 3-step progression plan.
          Return JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                gateway: { type: Type.STRING },
                steps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["gateway", "steps"]
            }
          }
        });
        res.json(JSON.parse(response.text));
      } catch (error) {
        console.error("AI Gateway failed:", error);
        res.json(fallbacks.gateway(habit));
      }
    });

    app.get("/api/books/search", async (req, res) => {
      const { q } = req.query;
      if (!q) return res.json([]);
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q as string)}&maxResults=10`);
        const data = await response.json();
        const books = (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title,
          author: (item.volumeInfo.authors || []).join(", "),
          coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || "https://picsum.photos/seed/book/200/300"
        }));
        res.json(books);
      } catch (error) {
        console.error("Book search failed:", error);
        res.json([]);
      }
    });

    app.post("/api/ai/quotes", async (req, res) => {
      const { books } = req.body;
      if (!books || books.length === 0) return res.json([]);
      try {
        const ai = getAI();
        if (!ai) return res.json([]);

        const bookList = books.map((b: any) => `"${b.title}" by ${b.author}`).join(", ");
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate 5 profound, actionable quotes from the following books: ${bookList}. 
          If you can't find exact quotes, generate high-quality insights in the style of the author.
          Each quote must have the text, the author, and the book title.
          Return an array of objects.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  author: { type: Type.STRING },
                  bookTitle: { type: Type.STRING }
                },
                required: ["text", "author", "bookTitle"]
              }
            }
          }
        });
        res.json(JSON.parse(response.text));
      } catch (error) {
        console.error("AI Quotes failed:", error);
        res.json([]);
      }
    });

    app.post("/api/ai/book-highlight", async (req, res) => {
      const { title, author } = req.body;
      if (!title || !author) return res.json({ text: "", source: "" });
      try {
        const ai = getAI();
        if (!ai) return res.json({ text: "", source: "" });

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate one profound, core principle or highlight from the book "${title}" by ${author}. 
          The text should be a single, powerful sentence or short paragraph that represents a key lesson from the book.
          Return a JSON object with "text" and "source" (which should be "${title} by ${author}").`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                source: { type: Type.STRING }
              },
              required: ["text", "source"]
            }
          }
        });
        res.json(JSON.parse(response.text));
      } catch (error) {
        console.error("AI Book Highlight failed:", error);
        res.json({ text: "Focus on the core principle of this work.", source: `${title} by ${author}` });
      }
    });

    // --- Vite Middleware / Static Serving ---
    const distPath = path.resolve(process.cwd(), "dist");
    const distExists = fs.existsSync(distPath);
    const isProduction = process.env.NODE_ENV === "production" || distExists;

    console.log(`[Server] Mode: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`[Server] Dist Path: ${distPath} (Exists: ${distExists})`);

    if (!isProduction) {
      console.log("[Server] Starting Vite in middleware mode...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("[Server] Serving static files from dist...");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("<h1>404 Not Found</h1><p>The application build (dist/index.html) was not found on the server.</p>");
        }
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("[Server] Critical failure during startup:", error);
    process.exit(1);
  }
}

startServer();
