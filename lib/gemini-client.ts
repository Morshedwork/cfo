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
    if (typeof process !== "undefined" && process.env?.OPENAI_MODEL?.trim()) {
      this.openaiModel = process.env.OPENAI_MODEL.trim()
    }
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

  /** Same as analyzeFinancialData but streams text chunks for instant display (OpenAI only). Caller must accumulate for post-processing. */
  async *streamAnalyzeFinancialData(
    data: any,
    query: string,
    options?: { recentMessages?: { role: string; text: string }[]; advanced?: boolean; emotionHint?: string; currentSection?: string }
  ): AsyncGenerator<string, void, unknown> {
    const recent = options?.recentMessages ?? []
    const advanced = options?.advanced ?? true
    const emotionHint = options?.emotionHint
    const currentSection = options?.currentSection
    const fullKnowledge = this.buildFullKnowledgeContext(data)
    let systemPrompt = this.buildVoiceSystemPrompt(advanced, fullKnowledge)
    if (currentSection) {
      systemPrompt += `\n\nCONTEXT: The user is currently on the "${currentSection}" section of the app. When relevant, tailor your reply to this section (e.g. on Bookkeeping: suggest logging expenses or reviewing transactions; on Runway: focus on runway and burn; on Dashboard: offer overview or navigation). Keep answers conversational and helpful for where they are.`
    }
    if (emotionHint) {
      systemPrompt += `\n\nCURRENT TURN: The user's message may convey ${emotionHint}. Acknowledge it in one short phrase and match your tone accordingly.`
    }
    const messages = recent.slice(-24).map((m) => ({ role: m.role, text: m.text }))
    const maxTokens = advanced ? 400 : 180
    yield* this.streamConversationalVoice(systemPrompt, messages, query, maxTokens)
  }

  async analyzeFinancialData(data: any, query: string, options?: { recentMessages?: { role: string; text: string }[]; advanced?: boolean; emotionHint?: string; taskHint?: string; currentSection?: string }): Promise<any> {
    const recent = options?.recentMessages ?? []
    const advanced = options?.advanced ?? true
    const emotionHint = options?.emotionHint
    const taskHint = options?.taskHint
    const currentSection = options?.currentSection

    const fullKnowledge = this.buildFullKnowledgeContext(data)
    let systemPrompt = this.buildVoiceSystemPrompt(advanced, fullKnowledge)
    if (currentSection) {
      systemPrompt += `\n\nCONTEXT: The user is currently on the "${currentSection}" section of the app. When relevant, tailor your reply to this section (e.g. on Bookkeeping: suggest logging expenses or reviewing transactions; on Runway: focus on runway and burn; on Dashboard: offer overview or navigation). Keep answers conversational and helpful for where they are.`
    }
    if (emotionHint) {
      systemPrompt += `\n\nThis turn: user may convey ${emotionHint}. Acknowledge briefly, then answer.`
    }
    if (taskHint === "investor_summary") {
      systemPrompt += `

This turn: The user asked for an investor-ready summary. Give a concise quarterly investor summary in 3 parts: (1) One sentence headline on traction, runway, and growth. (2) Key numbers: cash, runway in months, MRR, growth rate. (3) One sentence on recommended next steps. Total 60-90 words, no markdown, voice-friendly. Do not output ACTIONS unless they also asked to open a page.`
    }
    // Minimal turns for speed; enough to resolve "it"/"yes"/"open that"
    const messages = recent.slice(-6)
    const maxTokens = taskHint === "investor_summary" ? 200 : advanced ? 150 : 120

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
    lines.push(`Company: ${data.companyName ?? "Your Company"} | Industry: ${data.industry ?? "Technology"} | Stage: ${data.fundingStage ?? "Seed"} | Team: ${data.teamSize ?? "—"}`)
    lines.push(`Cash: $${Number(data.cashBalance || 0).toLocaleString()} | Burn: $${Number(data.monthlyBurn || 0).toLocaleString()}/mo | Runway: ${data.runway ?? "—"} mo`)
    lines.push(`Revenue: $${Number(data.monthlyRevenue || data.mrr || 0).toLocaleString()}/mo | Growth: ${data.revenueGrowth ?? "—"}%`)
    if (data.topExpenses?.length > 0) {
      lines.push(`Costs: ${data.topExpenses.slice(0, 3).map((e: any) => `${e.category} $${Number(e.amount || 0).toLocaleString()}`).join("; ")}`)
    }
    if (data.recentTransactions?.length > 0) {
      const recent = data.recentTransactions.slice(0, 4).map((t: any) => `${t.type === "revenue" ? "+" : "-"}$${Math.abs(Number(t.amount || 0)).toLocaleString()}`)
      lines.push(`Recent: ${recent.join(" ")}`)
    }
    return lines.join("\n")
  }

  private buildVoiceSystemPrompt(advanced: boolean, fullKnowledge: string): string {
    // Compact prompt for low latency: essentials only, no long examples
    if (advanced) {
      return `You are Aura, the Strategic Financial Growth Manager. Voice reply: short, natural, 2-4 sentences. Resolve "it"/"that"/"yes" from recent turns. Acknowledge emotion in one phrase when clear, then answer with specific numbers.

DATA:
${fullKnowledge}

AGENT CAPABILITIES (when user wants to do something, end with exactly one ACTIONS: line):
- OPEN a page: ACTIONS: navigate /path (paths: /dashboard, /runway, /bookkeeping, /sales, /data-management, /ai-assistant, /settings, /dashboard/scenarios, /dashboard/market-intelligence, /voice-assistant).
- LOG expense/revenue: ACTIONS: add_expense amount=X category=Y or add_revenue amount=X category=Y.
- RUN REPORT: ACTIONS: run_report runway|burn|revenue|week.
- SUMMARIZE: give a short spoken summary; optional ACTIONS: summarize week|month.
- Growth scenarios / what-if: short answer + optional ACTIONS: navigate /dashboard/scenarios.
- Market intelligence: short answer + ACTIONS: run_market_intel overview|competitors|ad_spend|seo|benchmarks|opportunities.
- Export/download data: short answer + ACTIONS: export_data.
- Compare periods (month/quarter): give comparison from their data, then ACTIONS: compare_periods month|quarter.
- Top expenses / expense breakdown: state biggest category, then ACTIONS: show_top_expenses.
- Cash flow / burn trend: short answer, then ACTIONS: show_cash_flow.

Reply in 50–95 words, conversational and voice-friendly. No markdown. If executing a task, end with exactly one ACTIONS: line. Always consider emotion first, then answer. Lead with the single most important number or action; be specific and concise.`
    }
    return `You're Aura. Answer in 40-60 words MAX. NO markdown. Be conversational and actionable. Lead with the key number or action. Acknowledge the user's emotion when clear (worried, frustrated, excited) in one phrase, then answer.\n\n${fullKnowledge}`
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

  /**
   * Stream conversational voice response (OpenAI only). Yields text chunks for instant display.
   * Falls back to single yield of full text for non-OpenAI or fallback mode.
   */
  async *streamConversationalVoice(
    systemPrompt: string,
    recentMessages: { role: string; text: string }[],
    currentQuery: string,
    maxTokens: number
  ): AsyncGenerator<string, void, unknown> {
    if (this.apiKey === "fallback-mode") {
      yield STATIC_MSG_NO_KEY
      return
    }
    if (this.useOpenAI) {
      yield* this.streamOpenAIConversation(systemPrompt, recentMessages, currentQuery, maxTokens)
      return
    }
    if (this.useOpenRouter) {
      const full = await this.generateOpenRouterConversation(systemPrompt, recentMessages, currentQuery, maxTokens)
      yield full
      return
    }
    const full = await this.generateGeminiConversation(systemPrompt, recentMessages, currentQuery, maxTokens)
    yield full
  }

  private async *streamOpenAIConversation(
    systemPrompt: string,
    recentMessages: { role: string; text: string }[],
    currentQuery: string,
    maxTokens: number
  ): AsyncGenerator<string, void, unknown> {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: m.text,
      })),
      { role: "user", content: currentQuery },
    ]
    const res = await fetch(this.openaiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages,
        temperature: 0.74,
        max_tokens: maxTokens,
        stream: true,
      }),
    })
    if (!res.ok || !res.body) {
      const err = await res.text()
      console.error("[OpenAI] Stream error:", res.status, err)
      yield STATIC_MSG_ERROR
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (typeof content === "string" && content) yield content
            } catch {
              // skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
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
          temperature: 0.74,
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
          temperature: 0.74,
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
          temperature: 0.74,
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

  /** Parse raw LLM text into { text, insights, recommendations } (e.g. after streaming). */
  parseResponseFromRaw(rawText: string): { text: string; insights: string[]; recommendations: string[] } {
    const cleaned = this.removeMarkdown(rawText)
    return this.parseFinancialResponse(cleaned)
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

function isRealApiKey(key: string | undefined): boolean {
  if (!key || typeof key !== "string") return false
  const trimmed = key.trim()
  return trimmed.length > 20 && !trimmed.startsWith("your_")
}

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    // Server-side only - never exposed to client. Prefer OpenAI when set.
    const openaiKey = process.env.OPENAI_API_KEY
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    if (isRealApiKey(openaiKey)) {
      console.log("[AI] OpenAI API key found, using OpenAI with key:", openaiKey!.substring(0, 10) + "***")
      geminiClient = new GeminiClient(openaiKey!, "openai")
    } else if (isRealApiKey(openRouterKey)) {
      console.log("[AI] OpenRouter API key found, using OpenRouter with key:", openRouterKey!.substring(0, 10) + "***")
      geminiClient = new GeminiClient(openRouterKey!, "openrouter")
    } else if (isRealApiKey(geminiKey)) {
      console.log("[AI] Gemini API key found, using Gemini with key:", geminiKey!.substring(0, 10) + "***")
      geminiClient = new GeminiClient(geminiKey!, "gemini")
    } else {
      console.warn("[AI] No valid API key (OPENAI_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY). Set a real key in .env.local or using fallback.")
      geminiClient = new GeminiClient("fallback-mode", "fallback")
    }
  }
  return geminiClient
}

// Check if we're in fallback mode (no valid API key)
export function isFallbackMode(): boolean {
  return (
    !isRealApiKey(process.env.OPENAI_API_KEY) &&
    !isRealApiKey(process.env.OPENROUTER_API_KEY) &&
    !isRealApiKey(process.env.GEMINI_API_KEY)
  )
}

// Voice agent: always use OpenAI when OPENAI_API_KEY is set; otherwise fallback.
let voiceAIClient: GeminiClient | null = null

export function getVoiceAIClient(): GeminiClient {
  if (!voiceAIClient) {
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      console.log("[AI Voice] Using OpenAI for voice agent, key:", openaiKey.substring(0, 10) + "***")
      voiceAIClient = new GeminiClient(openaiKey, "openai")
    } else {
      console.warn("[AI Voice] OPENAI_API_KEY not set; voice agent using fallback. Set OPENAI_API_KEY in .env.local for live voice.")
      voiceAIClient = new GeminiClient("fallback-mode", "fallback")
    }
  }
  return voiceAIClient
}

export function isVoiceFallbackMode(): boolean {
  return !process.env.OPENAI_API_KEY
}
