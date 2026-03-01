const STATIC_MSG_NO_KEY =
  "Real-time AI isn't configured. Please set OPENAI_API_KEY in your environment to get live answers."
const STATIC_MSG_ERROR = "I couldn't complete that request. Please try again or check your API key."

type AIProvider = "openai" | "gemini" | "openrouter" | "fallback"

// AI API client for all AI features (OpenAI only)
export class GeminiClient {
  private apiKey: string
  private provider: AIProvider
  private openaiUrl = "https://api.openai.com/v1/chat/completions"
  private openaiModel = "gpt-4o-mini"
  private openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
  private geminiUrl = "https://generativelanguage.googleapis.com/v1beta"
  private openRouterModel = "deepseek/deepseek-chat"
  private geminiModel = "gemini-1.5-flash"

  constructor(apiKey: string, provider: AIProvider = "openai") {
    this.apiKey = apiKey
    this.provider = provider
  }

  private get useOpenRouter(): boolean {
    return this.provider === "openrouter"
  }

  private get useOpenAI(): boolean {
    return this.provider === "openai"
  }

  async generateText(prompt: string, context?: any): Promise<string> {
    if (this.apiKey === "fallback-mode") {
      console.log("[AI] No API key configured")
      return STATIC_MSG_NO_KEY
    }

    if (this.useOpenAI) {
      return this.generateWithOpenAI(prompt, context, 150)
    }
    if (this.useOpenRouter) {
      return this.generateWithOpenRouter(prompt, context, 150)
    }
    return this.generateWithGemini(prompt, context, 150)
  }

  /** Generate text with custom token limit (for agent reports, market intelligence, etc.). */
  async generateTextWithLimit(prompt: string, maxTokens: number = 600): Promise<string> {
    if (this.apiKey === "fallback-mode") {
      return STATIC_MSG_NO_KEY
    }
    if (this.useOpenAI) {
      return this.generateWithOpenAI(prompt, undefined, maxTokens)
    }
    if (this.useOpenRouter) {
      return this.generateWithOpenRouter(prompt, undefined, maxTokens)
    }
    return this.generateWithGemini(prompt, undefined, maxTokens)
  }

  private async generateWithOpenAI(prompt: string, context?: any, maxTokensOverride?: number): Promise<string> {
    console.log("[OpenAI] Attempting API call with model:", this.openaiModel)

    try {
      const fullPrompt = context !== undefined ? this.buildPromptWithContext(prompt, context) : prompt
      const maxTokens = maxTokensOverride ?? 150

      const response = await fetch(this.openaiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: [
            {
              role: "system",
              content:
                "You are Aura, the Strategic Financial Growth Manager — internal finance plus market intelligence. Be conversational and helpful. Answer in 40-60 words MAXIMUM. NO asterisks or markdown. Give clear, direct answers with specific numbers. Focus on revenue growth, capital efficiency, and measurable improvements.",
            },
            { role: "user", content: fullPrompt },
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[OpenAI] API error", response.status, ":", errorText)
        return STATIC_MSG_ERROR
      }

      const data = await response.json()
      const result = data.choices?.[0]?.message?.content

      if (result) {
        console.log("[OpenAI] API call successful, response length:", result.length)
        return result
      }
      console.error("[OpenAI] No text in response:", JSON.stringify(data))
      return STATIC_MSG_ERROR
    } catch (error) {
      console.error("[OpenAI] API call exception:", error)
      return STATIC_MSG_ERROR
    }
  }

  private async generateWithOpenRouter(prompt: string, context?: any, maxTokensOverride?: number): Promise<string> {
    console.log("[OpenRouter] Attempting API call with model:", this.openRouterModel)

    try {
      const fullPrompt = context !== undefined ? this.buildPromptWithContext(prompt, context) : prompt
      const maxTokens = maxTokensOverride ?? 150
      
      const response = await fetch(this.openRouterUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://aura-cfo.app",
          "X-Title": "Aura Strategic Financial Growth Manager"
        },
        body: JSON.stringify({
          model: this.openRouterModel,
          messages: [
            {
              role: "system",
              content: "You are Aura, the Strategic Financial Growth Manager — internal finance plus market intelligence. Be conversational and helpful. Answer in 40-60 words MAXIMUM. NO asterisks or markdown. Give clear, direct answers with specific numbers. Focus on revenue growth, capital efficiency, and measurable improvements."
            },
            {
              role: "user",
              content: fullPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
          top_p: 0.95,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[OpenRouter] API error ${response.status}:`, errorText)
        return STATIC_MSG_ERROR
      }

      const data = await response.json()
      const result = data.choices?.[0]?.message?.content
      
      if (result) {
        console.log("[OpenRouter] API call successful, response length:", result.length)
        return result
      } else {
        console.error("[OpenRouter] No text in response:", JSON.stringify(data))
        return STATIC_MSG_ERROR
      }
    } catch (error) {
      console.error("[OpenRouter] API call exception:", error)
      return STATIC_MSG_ERROR
    }
  }

  private async generateWithGemini(prompt: string, context?: any, maxTokensOverride?: number): Promise<string> {
    console.log("[Gemini] Attempting API call with model:", this.geminiModel)

    const maxTokens = maxTokensOverride ?? 150
    const textInput = context !== undefined ? this.buildPromptWithContext(prompt, context) : prompt

    try {
      const response = await fetch(`${this.geminiUrl}/models/${this.geminiModel}:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: textInput,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: maxTokens,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        const parsed = this.parseGeminiError(errorText, response.status)
        console.error(`[Gemini] API error ${response.status}:`, parsed.message, parsed.details || errorText)
        return parsed.userMessage
      }

      const data = await response.json()
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text
      const blockReason = data.candidates?.[0]?.finishReason

      if (result) {
        console.log("[Gemini] API call successful, response length:", result.length)
        return result
      }
      if (blockReason === "SAFETY" || data.promptFeedback?.blockReason) {
        const reason = data.promptFeedback?.blockReason || blockReason
        console.error("[Gemini] Content blocked:", reason, JSON.stringify(data))
        return "Your request was blocked by safety filters. Try rephrasing or a different question."
      }
      console.error("[Gemini] No text in response:", JSON.stringify(data))
      return STATIC_MSG_ERROR
    } catch (error) {
      console.error("[Gemini] API call exception:", error)
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("ECONNREFUSED")) {
        return "Network error talking to Gemini. Check your connection and try again."
      }
      return STATIC_MSG_ERROR
    }
  }

  /** Parse Gemini API error JSON into a user-friendly message. */
  private parseGeminiError(body: string, status: number): { message: string; details?: string; userMessage: string } {
    try {
      const data = JSON.parse(body)
      const err = data?.error || data
      const code = err?.code ?? status
      const message = err?.message || err?.status || body
      const details = typeof message === "string" ? message : JSON.stringify(message)

      if (code === 400 && details.toLowerCase().includes("api key")) {
        return { message: details, details: body, userMessage: "Invalid or missing Gemini API key. Check GEMINI_API_KEY in .env.local and that the key is valid at https://aistudio.google.com/app/apikey" }
      }
      if (code === 403 || details.toLowerCase().includes("permission") || details.toLowerCase().includes("forbidden")) {
        return { message: details, details: body, userMessage: "Gemini API access denied. Enable the Generative Language API and check key restrictions at https://aistudio.google.com/app/apikey" }
      }
      if (code === 404 || details.toLowerCase().includes("not found")) {
        return { message: details, details: body, userMessage: "Gemini model not found. The app may need an update, or try setting OPENROUTER_API_KEY as an alternative." }
      }
      if (code === 429 || details.toLowerCase().includes("quota") || details.toLowerCase().includes("rate")) {
        return { message: details, details: body, userMessage: "Gemini rate limit or quota exceeded. Wait a moment or check usage at https://aistudio.google.com" }
      }

      return { message: details, details: body, userMessage: STATIC_MSG_ERROR }
    } catch {
      return { message: body, details: body, userMessage: STATIC_MSG_ERROR }
    }
  }

  private _removedFallback(_prompt: string, _context?: any): string {
    return STATIC_MSG_NO_KEY
  }

  private _removedFallbackBody_unused(_context?: any): string {
    const growth = _context?.revenueGrowth ?? _context?.growth
    const runway = _context?.runway != null ? String(_context.runway) : "3.3"
    const cash = _context?.cashBalance != null ? Number(_context.cashBalance).toLocaleString() : "150,000"
    const burn = _context?.monthlyBurn != null ? Number(_context.monthlyBurn).toLocaleString() : "45,000"
    const mrr = _context?.mrr != null ? Number(_context.mrr).toLocaleString() : _context?.monthlyRevenue != null ? Number(_context.monthlyRevenue).toLocaleString() : "28,000"
    const growthPct = growth != null ? String(growth) : "18"
    const promptLower = ""

    if (promptLower.includes("runway") || promptLower.includes("cash") || promptLower.includes("how long")) {
      return `Looking at your numbers, you've got about ${runway} months of runway with $${cash} in the bank and a monthly burn of $${burn}. Here's the thing - that's definitely in the "need attention" zone. I'd recommend starting fundraising conversations now and looking for quick wins to reduce burn by 15-20%.`
    }
    if (promptLower.includes("revenue") || promptLower.includes("growth") || promptLower.includes("growing")) {
      return `Your revenue story is interesting. You're at $${mrr} MRR with ${growthPct}% growth. Double down on what's working, focus on retention, and consider if you're undercharging. At this rate you can be in a stronger position in 6-9 months.`
    }
    if (promptLower.includes("expense") || promptLower.includes("cost") || promptLower.includes("spending")) {
      return `Your burn is $${burn} per month. Biggest chunks are usually payroll, then marketing, then infrastructure. Audit marketing ROI and review your tool stack. Goal is capital efficiency — every dollar working hard for you.`
    }
    if (promptLower.includes("fundrais") || promptLower.includes("investor") || promptLower.includes("raise")) {
      return `With ${runway} months runway and ${growthPct}% growth, start fundraising now. It often takes 3-6 months. Get your story tight on growth and traction, and aim to close before you hit 2 months of runway.`
    }
    if (promptLower.includes("what should") || promptLower.includes("focus") || promptLower.includes("priority")) {
      return `Based on $${cash} cash and ${runway} months runway: (1) Accelerate revenue, (2) Extend runway with better terms or small cuts, (3) Start fundraising prep. What feels like the biggest lever to you?`
    }
    return STATIC_MSG_NO_KEY
  }

  async analyzeFinancialData(data: any, query: string, options?: { recentMessages?: { role: string; text: string }[]; advanced?: boolean; emotionHint?: string }): Promise<any> {
    const recent = options?.recentMessages ?? []
    const advanced = options?.advanced ?? true
    const emotionHint = options?.emotionHint

    const fullKnowledge = this.buildFullKnowledgeContext(data)
    let systemPrompt = this.buildVoiceSystemPrompt(advanced, fullKnowledge)
    if (emotionHint) {
      systemPrompt += `\n\nCURRENT TURN: The user's message may convey ${emotionHint}. Acknowledge it in one short phrase and match your tone accordingly.`
    }
    const messages = recent.slice(-24)
    const maxTokens = advanced ? 320 : 150

    if (advanced) {
      const response = await this.generateConversationalVoice(systemPrompt, messages, query, maxTokens, data)
      const cleanedResponse = this.removeMarkdown(response)
      return this.parseFinancialResponse(cleanedResponse)
    }

    const contextBlurb = recent.length > 0
      ? `Recent conversation — use this to resolve "it", "there", "yes", "that one", "open it", "go there", "run that", "same thing": ${recent.slice(-8).map((m) => `${m.role}: ${m.text.slice(0, 150)}`).join(" | ")}. Infer the user's intent from the last assistant message when they give a short follow-up.`
      : ""
    const prompt = advanced
      ? `${systemPrompt}
${contextBlurb}

User (voice): "${query}"

Reply in 50-80 words, conversational and voice-friendly. Use specific numbers. If executing a task, end with exactly one ACTIONS: line. No markdown.`
      : `You're Aura, the Strategic Financial Growth Manager. Answer in 40-60 words MAX. NO markdown or asterisks - clean text only. Focus on revenue growth, capital efficiency, and measurable improvements.

${fullKnowledge}

Question: "${query}"

Be conversational, give specific numbers, and be actionable. Answer directly.`

    const response = await this.generateTextForVoice(prompt, maxTokens, data)
    const cleanedResponse = this.removeMarkdown(response)
    return this.parseFinancialResponse(cleanedResponse)
  }

  private buildFullKnowledgeContext(data: any): string {
    const lines: string[] = []
    lines.push(`Company: ${data.companyName ?? "Your Company"} | Industry: ${data.industry ?? "Technology"} | Stage: ${data.fundingStage ?? "Seed"} | Team: ${data.teamSize ?? "—"} people`)
    lines.push(`Cash: $${Number(data.cashBalance || 0).toLocaleString()} | Monthly burn: $${Number(data.monthlyBurn || 0).toLocaleString()} | Runway: ${data.runway ?? "—"} months`)
    lines.push(`Revenue: $${Number(data.monthlyRevenue || data.mrr || 0).toLocaleString()}/mo | Growth: ${data.revenueGrowth ?? "—"}% | Burn growth: ${data.burnGrowth ?? "—"}%`)
    if (data.topExpenses?.length > 0) {
      lines.push(`Top costs: ${data.topExpenses.slice(0, 5).map((e: any) => `${e.category} $${Number(e.amount || 0).toLocaleString()} (${e.percentage ?? 0}%)`).join("; ")}`)
    }
    if (data.recentTransactions?.length > 0) {
      const recent = data.recentTransactions.slice(0, 6).map((t: any) => `${t.type === "revenue" ? "+" : ""}$${Math.abs(Number(t.amount || 0)).toLocaleString()} ${(t.description || t.category || "").slice(0, 30)}`)
      lines.push(`Recent activity: ${recent.join("; ")}`)
    }
    if (data.cashFlowHistory?.length > 0) {
      const last = data.cashFlowHistory[data.cashFlowHistory.length - 1]
      lines.push(`Latest trend: ${last?.month ?? ""} cash $${Number(last?.cash || 0).toLocaleString()}, burn $${Number(last?.burn || 0).toLocaleString()}, revenue $${Number(last?.revenue || 0).toLocaleString()}`)
    }
    return lines.join("\n")
  }

  private buildVoiceSystemPrompt(advanced: boolean, fullKnowledge: string): string {
    const listeningBlock = `LISTENING & DEPTH (core behavior):
- Listen to the full user message before responding. Do not react to the first few words only; consider the whole utterance (e.g. "What's my runway and can you open the dashboard?" = two intents).
- Use the full conversation history with depth: resolve "it", "that", "yes", "open it", "go there", "same thing", "that report", "the runway" from the most recent relevant turn. If the user gives a short follow-up after you offered something, treat it as acceptance or clarification of that offer.
- Infer intent from context: e.g. "yes" or "do it" after you said "Want me to open the runway?" means navigate to runway; "why?" often refers to the last thing you or they said.
- When the user combines multiple requests in one message, address each part (answer the question and perform the action, or clarify which they want first).`

    const emotionBlock = `EMOTION & REAL-TIME CONVERSATION (trained behavior):
- Read the user's emotion from their words and tone: worry, stress, frustration, excitement, relief, urgency, confusion, hope, disappointment, confidence.
- Acknowledge the emotion in one short phrase before or woven into your answer (e.g. "I get that that's stressful.", "That's great to hear.", "I hear you.", "Quick take:").
- Match your tone: reassuring when worried or stressed, calm and clear when frustrated, celebratory when they share good news, direct and focused when urgent, patient when confused.
- Respond as if you're in the room right now: use natural lead-ins like "So —", "Got it.", "Here's the thing:", "Bottom line:". Keep it real-time and human, not robotic or scripted.
- Never ignore clear emotion (e.g. "I'm worried about cash") — acknowledge it first, then give the numbers or action.`

    const examplesBlock = `EXAMPLES (emotion-aware, real-time replies):
User: "I'm really worried about our runway." → Aura: "I get that — runway is the thing to watch. Right now you're at about X months with $Y in the bank. The move I'd make: [one concrete step]. Want me to open the runway view?"
User: "This is so frustrating." → Aura: "I hear you. Let's focus on what you can control. [One clear option or number.] I can pull up the dashboard if you want to dig in."
User: "We hit our revenue target!" → Aura: "That's great to hear. [Tie to their numbers.] Keep that momentum — [one short suggestion]."
User: "I don't get why burn is so high." → Aura: "Quick take: [biggest driver]. [One sentence explanation.] I can break down the categories if you say 'open dashboard'."
User: "Just tell me if we're okay." → Aura: "Short answer: [yes/no and one number]. [One line of context.]"
User: "What's our runway? And open the dashboard." → Aura: [Give runway number and context.] "Opening the dashboard for you." + ACTIONS: navigate /dashboard.`

    return advanced
      ? `You are Aura, the Strategic Financial Growth Manager — having a real-time voice conversation. You have FULL KNOWLEDGE of the user's business and can reference it naturally. Respond like a live CFO: short, natural spoken sentences (2–4 at a time). Weave numbers into conversation when relevant; don't just list them. You can ask clarifying questions, confirm what they meant, or suggest next steps.

${listeningBlock}

${emotionBlock}

${examplesBlock}

YOUR FULL KNOWLEDGE (use this to answer anything):
${fullKnowledge}

AGENT CAPABILITIES (when user wants to do something, end with exactly one ACTIONS: line):
- OPEN a page: ACTIONS: navigate /path (paths: /dashboard, /runway, /bookkeeping, /sales, /data-management, /ai-assistant, /settings, /dashboard/scenarios, /dashboard/market-intelligence).
- LOG expense/revenue: ACTIONS: add_expense amount=X category=Y or add_revenue amount=X category=Y.
- RUN REPORT: ACTIONS: run_report runway|burn|revenue|week.
- SUMMARIZE: give a short spoken summary; optional ACTIONS: summarize week|month.
- Growth scenarios / what-if: short answer + optional ACTIONS: navigate /dashboard/scenarios.
- Market intelligence: short answer + ACTIONS: run_market_intel overview|competitors|ad_spend|seo|benchmarks|opportunities.

Reply in 50–95 words, conversational and voice-friendly. No markdown. If executing a task, end with exactly one ACTIONS: line. Always consider emotion first, then answer.`
      : `You're Aura. Answer in 40-60 words MAX. NO markdown. Be conversational and actionable. Acknowledge the user's emotion when clear (worried, frustrated, excited) in one phrase, then answer.\n\n${fullKnowledge}`
  }

  /** Multi-turn conversational voice: full chat history + current query for real-time dialogue. */
  private async generateConversationalVoice(
    systemPrompt: string,
    recentMessages: { role: string; text: string }[],
    currentQuery: string,
    maxOutputTokens: number,
    _financialContext?: any
  ): Promise<string> {
    if (this.apiKey === "fallback-mode") {
      return STATIC_MSG_NO_KEY
    }
    if (this.useOpenAI) {
      return this.generateOpenAIConversation(systemPrompt, recentMessages, currentQuery, maxOutputTokens)
    }
    if (this.useOpenRouter) {
      return this.generateOpenRouterConversation(systemPrompt, recentMessages, currentQuery, maxOutputTokens)
    }
    return this.generateGeminiConversation(systemPrompt, recentMessages, currentQuery, maxOutputTokens)
  }

  private async generateOpenAIConversation(
    systemPrompt: string,
    recentMessages: { role: string; text: string }[],
    currentQuery: string,
    maxTokens: number
  ): Promise<string> {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: m.text,
      })),
      { role: "user", content: currentQuery },
    ]
    try {
      const response = await fetch(this.openaiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages,
          temperature: 0.78,
          max_tokens: maxTokens,
        }),
      })
      if (!response.ok) {
        const err = await response.text()
        console.error("[OpenAI] Conversation error:", response.status, err)
        return STATIC_MSG_ERROR
      }
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      return text ?? STATIC_MSG_ERROR
    } catch (e) {
      console.error("[OpenAI] Conversation exception:", e)
      return STATIC_MSG_ERROR
    }
  }

  private async generateOpenRouterConversation(
    systemPrompt: string,
    recentMessages: { role: string; text: string }[],
    currentQuery: string,
    maxTokens: number
  ): Promise<string> {
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })),
      { role: "user", content: currentQuery },
    ]
    try {
      const response = await fetch(this.openRouterUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://aura-cfo.app",
          "X-Title": "Aura Voice",
        },
        body: JSON.stringify({
          model: this.openRouterModel,
          messages,
          temperature: 0.78,
          max_tokens: maxTokens,
          top_p: 0.95,
        }),
      })
      if (!response.ok) {
        const err = await response.text()
        console.error("[OpenRouter] Conversation error:", response.status, err)
        return STATIC_MSG_ERROR
      }
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      return text ?? STATIC_MSG_ERROR
    } catch (e) {
      console.error("[OpenRouter] Conversation exception:", e)
      return STATIC_MSG_ERROR
    }
  }

  private async generateGeminiConversation(
    systemPrompt: string,
    recentMessages: { role: string; text: string }[],
    currentQuery: string,
    maxTokens: number
  ): Promise<string> {
    const contents: { role: string; parts: { text: string }[] }[] = []
    for (const m of recentMessages) {
      const role = m.role === "assistant" ? "model" : "user"
      contents.push({ role, parts: [{ text: m.text }] })
    }
    contents.push({ role: "user", parts: [{ text: currentQuery }] })
    try {
      const body: Record<string, unknown> = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.78,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: maxTokens,
        },
      }
      const response = await fetch(
        `${this.geminiUrl}/models/${this.geminiModel}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )
      if (!response.ok) {
        const err = await response.text()
        const parsed = this.parseGeminiError(err, response.status)
        console.error("[Gemini] Conversation error:", response.status, parsed.message)
        return parsed.userMessage
      }
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      return text ?? STATIC_MSG_ERROR
    } catch (e) {
      console.error("[Gemini] Conversation exception:", e)
      return STATIC_MSG_ERROR
    }
  }

  /** Voice/agent use: generate with configurable max tokens (no context object in prompt). */
  private async generateTextForVoice(prompt: string, maxOutputTokens: number, _financialContext?: any): Promise<string> {
    if (this.apiKey === "fallback-mode") {
      return STATIC_MSG_NO_KEY
    }
    if (this.useOpenAI) {
      return this.generateWithOpenAI(prompt, null, maxOutputTokens)
    }
    if (this.useOpenRouter) {
      return this.generateWithOpenRouter(prompt, null, maxOutputTokens)
    }
    return this.generateWithGemini(prompt, null, maxOutputTokens)
  }

  private removeMarkdown(text: string): string {
    // Remove asterisks bold/italic
    let clean = text.replace(/\*\*([^*]+)\*\*/g, '$1')
    clean = clean.replace(/\*([^*]+)\*/g, '$1')
    // Remove markdown headers
    clean = clean.replace(/^#+\s+/gm, '')
    return clean
  }

  async categorizeTransaction(
    description: string,
    amount: number,
  ): Promise<{
    category: string
    confidence: number
    type: "expense" | "revenue"
  }> {
    // Fallback mode with intelligent categorization
    if (this.apiKey === "fallback-mode") {
      return this.categorizeFallback(description, amount)
    }

    const prompt = `Categorize this financial transaction:
Description: ${description}
Amount: $${amount}

Respond in JSON format:
{
  "category": "category name (e.g., Marketing, Payroll, Office, Services, etc.)",
  "confidence": confidence score 0-100,
  "type": "expense" or "revenue"
}`

    const response = await this.generateText(prompt)
    try {
      const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ""))
      return parsed
    } catch {
      return this.categorizeFallback(description, amount)
    }
  }

  private categorizeFallback(_description: string, amount: number): {
    category: string
    confidence: number
    type: "expense" | "revenue"
  } {
    const type: "expense" | "revenue" = amount < 0 ? "expense" : "revenue"
    return {
      category: type === "revenue" ? "Other Revenue" : "General Expense",
      confidence: 50,
      type,
    }
  }

  async processVoiceCommand(
    command: string,
    currentData: any,
  ): Promise<{
    action: string
    data: any
    message: string
  }> {
    // Fallback mode with intelligent voice processing
    if (this.apiKey === "fallback-mode") {
      return this.processVoiceFallback(command)
    }

    const prompt = `You are a voice assistant for a financial management system. Process this voice command and extract structured data.

Voice Command: "${command}"

Current Financial Context:
${JSON.stringify(currentData, null, 2)}

Respond in JSON format:
{
  "action": "add_expense" | "add_revenue" | "query_data" | "update_forecast",
  "data": {
    "description": "extracted description",
    "amount": extracted amount as number,
    "category": "extracted category",
    "date": "YYYY-MM-DD format"
  },
  "message": "confirmation message to user"
}`

    const response = await this.generateText(prompt)
    try {
      const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ""))
      return parsed
    } catch {
      return this.processVoiceFallback(command)
    }
  }

  private processVoiceFallback(_command: string): {
    action: string
    data: any
    message: string
  } {
    return {
      action: "query_data",
      data: {},
      message: STATIC_MSG_NO_KEY,
    }
  }

  private buildPromptWithContext(prompt: string, context?: any): string {
    if (!context) {
      return `Aura Strategic Financial Growth Manager. Answer in 40-60 words MAX. NO markdown. Be direct and helpful. ${prompt}`
    }

    return `Aura Strategic Financial Growth Manager. 40-60 words MAX. NO markdown. Be conversational.

Data: Cash $${context.cashBalance?.toLocaleString()} | Burn $${context.monthlyBurn?.toLocaleString()}/mo | Runway ${context.runway}mo | MRR $${context.mrr?.toLocaleString()} | Growth ${context.growth}%

Q: ${prompt}

Give specific numbers. Be direct and actionable.`
  }

  private parseFinancialResponse(response: string): any {
    // Extract structured data from response
    return {
      text: response,
      insights: this.extractInsights(response),
      recommendations: this.extractRecommendations(response),
    }
  }

  private extractInsights(text: string): string[] {
    const insights: string[] = []
    const lines = text.split("\n")
    for (const line of lines) {
      if (line.includes("•") || line.match(/^\d+\./)) {
        insights.push(line.trim())
      }
    }
    return insights
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = []
    const lines = text.split("\n")
    let inRecommendations = false
    for (const line of lines) {
      if (line.toLowerCase().includes("recommend")) {
        inRecommendations = true
      }
      if (inRecommendations && (line.includes("•") || line.match(/^\d+\./))) {
        recommendations.push(line.trim())
      }
    }
    return recommendations
  }
}

// Singleton instance
let geminiClient: GeminiClient | null = null

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      console.log("[AI] Using OpenAI for all executions, key:", openaiKey.substring(0, 10) + "***")
      geminiClient = new GeminiClient(openaiKey, "openai")
    } else {
      console.warn("[AI] No OPENAI_API_KEY found, using fallback. Set OPENAI_API_KEY in .env.local for live AI.")
      geminiClient = new GeminiClient("fallback-mode", "fallback")
    }
  }
  return geminiClient
}

// Check if we're in fallback mode (no OpenAI API key configured)
export function isFallbackMode(): boolean {
  return !process.env.OPENAI_API_KEY
}

// Voice-only: use OpenAI for execution when OPENAI_API_KEY is set; otherwise fallback.
// This ensures all voice AI (assistant + process) runs on OpenAI when the key is configured.
let voiceAIClient: GeminiClient | null = null

export function getVoiceAIClient(): GeminiClient {
  if (!voiceAIClient) {
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      console.log("[AI Voice] Using OpenAI for voice execution, key:", openaiKey.substring(0, 10) + "***")
      voiceAIClient = new GeminiClient(openaiKey, "openai")
    } else {
      console.warn("[AI Voice] OPENAI_API_KEY not set; voice AI using fallback responses. Set OPENAI_API_KEY for live voice.")
      voiceAIClient = new GeminiClient("fallback-mode", "fallback")
    }
  }
  return voiceAIClient
}

export function isVoiceFallbackMode(): boolean {
  return !process.env.OPENAI_API_KEY
}
