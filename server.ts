import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import {
  approvePiPayment,
  cancelPiPayment,
  completePiPayment,
  resumeServerIncompletePayments,
} from "./api/_lib/piPlatform.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "EYENEKA" });
  });

  app.post("/api/pi/approve", async (req, res) => {
    try {
      const result = await approvePiPayment(String(req.body?.paymentId ?? ""));
      res.status(result.status).json(result.body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Approval request failed.";
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post("/api/pi/complete", async (req, res) => {
    try {
      const result = await completePiPayment({
        paymentId: req.body?.paymentId,
        txid: req.body?.txid,
        amount: req.body?.amount,
        memo: req.body?.memo,
        metadata: req.body?.metadata,
      });
      res.status(result.status).json(result.body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Completion request failed.";
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post("/api/pi/incomplete", async (_req, res) => {
    try {
      const result = await resumeServerIncompletePayments();
      res.status(result.status).json(result.body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Incomplete payment check failed.";
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post("/api/pi/cancel", async (req, res) => {
    try {
      const result = await cancelPiPayment(req.body?.paymentId);
      res.status(result.status).json(result.body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Cancel request failed.";
      res.status(500).json({ ok: false, error: message });
    }
  });

  app.post("/api/mentor", async (req, res) => {
    try {
      const { question, language = "English", lessonContext = "", history = [] } = req.body ?? {};

      if (!question || typeof question !== "string" || !question.trim()) {
        res.status(400).json({ error: "Please enter a question for the AI Mentor." });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: "AI Mentor is currently unavailable because GEMINI_API_KEY is not configured in Secrets.",
        });
        return;
      }

      const recentHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((m: { role?: string; text?: string }) => `${m.role === "user" ? "Learner" : "Mentor"}: ${m.text ?? ""}`)
            .join("\n")
        : "";

      const systemInstruction = [
        "You are the EYENEKA Learning Mentor inside a global Pi-native utility platform.",
        `Respond strictly in the learner's chosen language: ${language}.`,
        "Explain clearly in simple, encouraging, step-by-step numbered or bulleted points with ZERO technical jargon.",
        "Keep answers practical and focused on real-world skills (AI prompting, digital work, money safety, Pi escrow protection, food budgeting, or basic health literacy).",
        "Never ask for personal data, phone numbers, or off-app payments. Never mention any specific city or country.",
        "If asked for medical diagnosis, remind the learner that EYENEKA provides education only and to seek professional care.",
        lessonContext ? `Current lesson context: ${lessonContext}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const prompt = recentHistory
        ? `${recentHistory}\nLearner: ${question.trim()}`
        : question.trim();

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const answer = response.text?.trim();
      if (!answer) {
        res.status(502).json({ error: "No response received from AI Mentor. Please try again." });
        return;
      }

      res.json({ answer });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reach AI Mentor.";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EYENEKA server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start EYENEKA server:", error);
  process.exit(1);
});
