// AI API client for all AI features (supports OpenRouter and Gemini)
export class GeminiClient {
  private apiKey: string
  private useOpenRouter: boolean
  private openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
  private geminiUrl = "https://generativelanguage.googleapis.com/v1beta"
  private openRouterModel = "deepseek/deepseek-chat" // DeepSeek Chat - Fast, smart responses
  private geminiModel = "gemini-1.5-flash-latest"

  constructor(apiKey: string, useOpenRouter: boolean = false) {
    this.apiKey = apiKey
    this.useOpenRouter = useOpenRouter
  }

  async generateText(prompt: string, context?: any): Promise<string> {
    // Fallback mode - return intelligent demo responses
    if (this.apiKey === "fallback-mode") {
      console.log("[AI] Using fallback mode - no API key configured")
      return this.getFallbackResponse(prompt, context)
    }

    // Use OpenRouter if enabled
    if (this.useOpenRouter) {
      return this.generateWithOpenRouter(prompt, context)
    }

    // Otherwise use Gemini
    return this.generateWithGemini(prompt, context)
  }

  private async generateWithOpenRouter(prompt: string, context?: any): Promise<string> {
    console.log("[OpenRouter] Attempting API call with model:", this.openRouterModel)

    try {
      const fullPrompt = this.buildPromptWithContext(prompt, context)
      
      const response = await fetch(this.openRouterUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://aura-cfo.app",
          "X-Title": "Aura CFO Voice Assistant"
        },
        body: JSON.stringify({
          model: this.openRouterModel,
          messages: [
            {
              role: "system",
              content: "You are Aura, a smart AI CFO assistant. Be conversational and helpful. Answer in 40-60 words MAXIMUM. NO asterisks or markdown. Give clear, direct answers with specific numbers. Be quick and actionable."
            },
            {
              role: "user",
              content: fullPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150, // Quick, concise responses
          top_p: 0.95,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[OpenRouter] API error ${response.status}:`, errorText)
        return this.getFallbackResponse(prompt, context)
      }

      const data = await response.json()
      const result = data.choices?.[0]?.message?.content
      
      if (result) {
        console.log("[OpenRouter] API call successful, response length:", result.length)
        return result
      } else {
        console.error("[OpenRouter] No text in response:", JSON.stringify(data))
        return this.getFallbackResponse(prompt, context)
      }
    } catch (error) {
      console.error("[OpenRouter] API call exception:", error)
      return this.getFallbackResponse(prompt, context)
    }
  }

  private async generateWithGemini(prompt: string, context?: any): Promise<string> {
    console.log("[Gemini] Attempting API call with model:", this.geminiModel)

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
                  text: this.buildPromptWithContext(prompt, context),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150, // Quick, concise responses
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[Gemini] API error ${response.status}: ${response.statusText}`, errorText)
        return this.getFallbackResponse(prompt, context)
      }

      const data = await response.json()
      const result = data.candidates[0]?.content?.parts[0]?.text
      
      if (result) {
        console.log("[Gemini] API call successful, response length:", result.length)
        return result
      } else {
        console.error("[Gemini] No text in response:", JSON.stringify(data))
        return this.getFallbackResponse(prompt, context)
      }
    } catch (error) {
      console.error("[Gemini] API call exception:", error)
      return this.getFallbackResponse(prompt, context)
    }
  }

  private getFallbackResponse(prompt: string, context?: any): string {
    // Intelligent fallback responses with conversational tone
    const promptLower = prompt.toLowerCase()
    
    if (promptLower.includes("runway") || promptLower.includes("cash") || promptLower.includes("how long")) {
      return `Looking at your numbers, you've got about ${context?.runway || "3.3"} months of runway with $${context?.cashBalance?.toLocaleString() || "150,000"} in the bank and a monthly burn of $${context?.monthlyBurn?.toLocaleString() || "45,000"}.\n\nHere's the thing - that's definitely in the "need attention" zone. I'd recommend:\n\n• Start having fundraising conversations NOW if you haven't already\n• Look for quick wins to reduce burn by 15-20%\n• Focus on revenue-generating activities that have proven ROI\n\nThe good news? You have time to be strategic about this. Use the next 60 days wisely to either improve your unit economics or line up your next round.`
    }
    
    if (promptLower.includes("revenue") || promptLower.includes("growth") || promptLower.includes("growing")) {
      return `Your revenue story is actually pretty interesting! You're at $${context?.mrr?.toLocaleString() || "28,000"} MRR with ${context?.growth || "18"}% month-over-month growth.\n\nWhat's exciting here is the growth momentum. At this rate, you could be looking at some serious revenue in the next 6-9 months. My take?\n\n• Double down on what's working - that growth isn't by accident\n• Focus heavily on retention (it's 5x cheaper than acquisition)\n• Start thinking about your pricing - you might be undercharging\n\nIf you can maintain even 15% growth for the next 8 months, you'll be in a much stronger position financially and for fundraising.`
    }
    
    if (promptLower.includes("expense") || promptLower.includes("cost") || promptLower.includes("spending")) {
      return `Let me break down your burn rate of $${context?.monthlyBurn?.toLocaleString() || "45,000"} per month:\n\nFrom what I'm seeing:\n• Payroll is likely your biggest chunk (usually 60-70%)\n• Then marketing and customer acquisition\n• Infrastructure and tools probably around 10-15%\n\nHere's my honest take - don't just cut costs for the sake of cutting. Instead:\n\n• Audit your marketing spend ROI - kill what doesn't work\n• Review your tool stack - you'd be surprised how much SaaS bloat happens\n• Consider if you're overstaffed in any areas\n\nThe goal isn't to starve your business, it's to be capital efficient. Every dollar should be working hard for you.`
    }
    
    if (promptLower.includes("fundrais") || promptLower.includes("investor") || promptLower.includes("raise")) {
      return `Okay, let's talk fundraising strategy. With ${context?.runway || "3.3"} months of runway and ${context?.growth || "18"}% growth, here's what I'm thinking:\n\nYou're in decent shape, but timing is everything. Start NOW because:\n\n• Fundraising takes 3-6 months on average\n• You want to raise from a position of strength, not desperation\n• Your growth numbers are actually compelling\n\nMy advice:\n\n• Get your story tight - focus on growth, market opportunity, and traction\n• Target investors who understand your space\n• Run a tight process - don't let it drag on\n\nAim to close your round before you hit 2 months of runway. That keeps you in control of the conversation.`
    }
    
    if (promptLower.includes("what should") || promptLower.includes("focus") || promptLower.includes("priority")) {
      return `Great question! Based on your current position - $${context?.cashBalance?.toLocaleString() || "150,000"} cash, ${context?.runway || "3.3"} months runway, growing at ${context?.growth || "18"}% - here's what I'd prioritize:\n\nTop 3 Focus Areas:\n\n1. Revenue Acceleration - Your growth is solid, but you need to compress the timeline. What can you do to turn that ${context?.growth || "18"}% into 25%?\n\n2. Extend Runway - You need breathing room. Can you negotiate better payment terms? Reduce unnecessary spend? Small changes compound.\n\n3. Fundraising Prep - Start building relationships now, even if you're not actively raising yet.\n\nThe key is balancing growth with survival. You're playing a game where you need to last long enough for the growth to compound. What's your gut telling you is the biggest opportunity right now?`
    }
    
    return `Hey! I'm here to help you understand your financial picture and make smarter decisions. Right now, here's what I see:\n\n• Cash: $${context?.cashBalance?.toLocaleString() || "150,000"}\n• Monthly Burn: $${context?.monthlyBurn?.toLocaleString() || "45,000"}\n• Runway: ${context?.runway || "3.3"} months\n• MRR: $${context?.mrr?.toLocaleString() || "28,000"}\n• Growth: ${context?.growth || "18"}%\n\nYou can ask me things like:\n• "What's my runway situation?"\n• "How's my revenue growth?"\n• "What should I focus on next?"\n• "When should I start fundraising?"\n\nWhat would be most helpful for you to know?`
  }

  async analyzeFinancialData(data: any, query: string): Promise<any> {
    const prompt = `You're Aura, an AI CFO. Answer in 40-60 words MAX. NO markdown or asterisks - clean text only.

FINANCIALS:
Cash: $${data.cashBalance?.toLocaleString()} | Burn: $${data.monthlyBurn?.toLocaleString()}/mo | Runway: ${data.runway}mo
Revenue: $${data.monthlyRevenue?.toLocaleString()}/mo | MRR: $${data.mrr?.toLocaleString()} | Growth: ${data.revenueGrowth}%
${data.topExpenses?.length > 0 ? `Top Costs: ${data.topExpenses.slice(0,2).map((e: any) => `${e.category} $${e.amount.toLocaleString()}`).join(', ')}` : ''}

Question: "${query}"

Be conversational, give specific numbers, and be actionable. Answer directly.`

    const response = await this.generateText(prompt)
    const cleanedResponse = this.removeMarkdown(response)
    return this.parseFinancialResponse(cleanedResponse)
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

  private categorizeFallback(description: string, amount: number): {
    category: string
    confidence: number
    type: "expense" | "revenue"
  } {
    const desc = description.toLowerCase()
    const type: "expense" | "revenue" = amount < 0 ? "expense" : "revenue"
    
    // Smart categorization based on keywords
    if (desc.includes("salary") || desc.includes("payroll") || desc.includes("wage")) {
      return { category: "Payroll", confidence: 95, type: "expense" }
    }
    if (desc.includes("marketing") || desc.includes("ads") || desc.includes("advertising")) {
      return { category: "Marketing", confidence: 90, type: "expense" }
    }
    if (desc.includes("office") || desc.includes("rent") || desc.includes("lease")) {
      return { category: "Office & Rent", confidence: 90, type: "expense" }
    }
    if (desc.includes("software") || desc.includes("saas") || desc.includes("subscription")) {
      return { category: "Software & Services", confidence: 88, type: "expense" }
    }
    if (desc.includes("travel") || desc.includes("hotel") || desc.includes("flight")) {
      return { category: "Travel", confidence: 85, type: "expense" }
    }
    if (desc.includes("sale") || desc.includes("payment") || desc.includes("invoice")) {
      return { category: "Revenue", confidence: 92, type: "revenue" }
    }
    if (desc.includes("consulting") || desc.includes("service")) {
      return { category: type === "revenue" ? "Service Revenue" : "Professional Services", confidence: 80, type }
    }
    
    return {
      category: type === "revenue" ? "Other Revenue" : "General Expense",
      confidence: 60,
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

  private processVoiceFallback(command: string): {
    action: string
    data: any
    message: string
  } {
    const cmd = command.toLowerCase()
    
    // Extract amount using regex
    const amountMatch = cmd.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?)?/)
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0
    
    // Detect action type
    if (cmd.includes("add") || cmd.includes("spent") || cmd.includes("paid")) {
      // Determine if it's expense or revenue
      const isRevenue = cmd.includes("revenue") || cmd.includes("income") || cmd.includes("received") || cmd.includes("earned")
      
      // Extract description
      let description = command
      if (amountMatch) {
        description = command.replace(amountMatch[0], "").trim()
      }
      
      // Extract category hints
      let category = "General"
      if (cmd.includes("marketing")) category = "Marketing"
      else if (cmd.includes("payroll") || cmd.includes("salary")) category = "Payroll"
      else if (cmd.includes("office") || cmd.includes("rent")) category = "Office"
      else if (cmd.includes("software") || cmd.includes("subscription")) category = "Software"
      else if (cmd.includes("travel")) category = "Travel"
      
      return {
        action: isRevenue ? "add_revenue" : "add_expense",
        data: {
          description: description || (isRevenue ? "Revenue" : "Expense"),
          amount: amount,
          category: category,
          date: new Date().toISOString().split("T")[0],
        },
        message: `Got it! I'll add a ${isRevenue ? "revenue" : "expense"} of $${amount.toLocaleString()} for ${category}.`,
      }
    }
    
    if (cmd.includes("how much") || cmd.includes("what is") || cmd.includes("show me")) {
      return {
        action: "query_data",
        data: { query: command },
        message: "Let me look that up for you...",
      }
    }
    
    if (cmd.includes("forecast") || cmd.includes("predict") || cmd.includes("runway")) {
      return {
        action: "update_forecast",
        data: {},
        message: "I'll update your financial forecast...",
      }
    }
    
    return {
      action: "query_data",
      data: {},
      message: "I'm not sure I understood that. Could you try rephrasing?",
    }
  }

  private buildPromptWithContext(prompt: string, context?: any): string {
    if (!context) {
      return `Aura AI CFO. Answer in 40-60 words MAX. NO markdown. Be direct and helpful. ${prompt}`
    }

    return `Aura AI CFO. 40-60 words MAX. NO markdown. Be conversational.

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
    // Server-side only - never exposed to client
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    if (isRealApiKey(openRouterKey)) {
      console.log("[AI] OpenRouter API key found, using OpenRouter with key:", openRouterKey!.substring(0, 10) + "***")
      geminiClient = new GeminiClient(openRouterKey!, true)
    } else if (isRealApiKey(geminiKey)) {
      console.log("[AI] Gemini API key found, using Gemini with key:", geminiKey!.substring(0, 10) + "***")
      geminiClient = new GeminiClient(geminiKey!, false)
    } else {
      console.warn("[AI] No valid API key (OPENROUTER_API_KEY or GEMINI_API_KEY). Set a real key in .env.local or using fallback.")
      geminiClient = new GeminiClient("fallback-mode", false)
    }
  }
  return geminiClient
}

// Check if we're in fallback mode (no valid API key)
export function isFallbackMode(): boolean {
  return !isRealApiKey(process.env.OPENROUTER_API_KEY) && !isRealApiKey(process.env.GEMINI_API_KEY)
}
