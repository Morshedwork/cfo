import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const basicAuth = () => {
  const raw = `${process.env.AGORA_CUSTOMER_ID}:${process.env.AGORA_CUSTOMER_SECRET}`;
  return "Basic " + Buffer.from(raw).toString("base64");
};

/**
 * START AGENT: calls CAI REST /join
 * POST https://api.agora.io/api/conversational-ai-agent/v2/projects/{appid}/join
 */
app.post("/agent/start", async (req, res) => {
  const { channel, rtcToken, remoteRtcUid } = req.body;

  const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${process.env.AGORA_CAI_APP_ID}/join`;

  const payload = {
    name: `agent_${Date.now()}`,
    properties: {
      channel,
      token: rtcToken,

      // IMPORTANT: if your RTC uses numeric uid, keep enable_string_uid=false
      enable_string_uid: false,

      // Optional but good: let the agent auto-exit if user leaves
      idle_timeout: 120, // doc describes idle_timeout behavior
      // target who the agent should pay attention to (your user)
      remote_rtc_uids: [String(remoteRtcUid ?? 0)],

      // LLM (OpenAI chat-completions compatible)
      llm: {
        url: "https://api.openai.com/v1/chat/completions",
        api_key: process.env.OPENAI_API_KEY,
        system_messages: [{ role: "system", content: "You are a helpful voice assistant." }],
        greeting_message: "Hi! How can I help?",
        failure_message: "Sorry, I couldn't process that.",
        max_history: 10,
        params: { model: "gpt-4o-mini" }
      },

      // ASR (keep simple first)
      asr: { language: "en-US" },

      // TTS (Azure example)
      tts: {
        vendor: "microsoft",
        params: {
          key: process.env.AZURE_TTS_KEY,
          region: process.env.AZURE_TTS_REGION,
          voice_name: "en-US-AndrewMultilingualNeural"
        }
      }
    }
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await r.json();
  return res.status(r.status).json(data);
});

/**
 * STOP AGENT: calls CAI REST /leave
 * POST https://api.agora.io/api/conversational-ai-agent/v2/projects/{appid}/agents/{agentId}/leave
 */
app.post("/agent/stop", async (req, res) => {
  const { agentId } = req.body;

  const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${process.env.AGORA_CAI_APP_ID}/agents/${agentId}/leave`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/json"
    }
  });

  // some responses may be empty; handle both
  const text = await r.text();
  const data = text ? JSON.parse(text) : {};
  return res.status(r.status).json(data);
});

app.listen(3000, () => console.log("CAI server running on http://localhost:3000"));