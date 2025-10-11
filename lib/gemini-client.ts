// Gemini API client for all AI features
export class GeminiClient {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta"
  private model = "gemini-1.5-flash-latest" // Using latest Gemini Flash model

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateText(prompt: string, context?: any): Promise<string> {
    // Fallback mode - return intelligent demo responses
    if (this.apiKey === "fallback-mode") {
      console.log("[Gemini] Using fallback mode - no API key configured")
      return this.getFallbackResponse(prompt, context)
    }

    console.log("[Gemini] Attempting API call with model:", this.model)

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
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
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
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
    // Intelligent fallback responses based on context
    const promptLower = prompt.toLowerCase()
    
    if (promptLower.includes("runway") || promptLower.includes("cash")) {
      return `Based on your current cash balance of $${context?.cashBalance?.toLocaleString() || "70,000"} and monthly burn rate of $${context?.monthlyBurn?.toLocaleString() || "82,000"}, you have approximately ${context?.runway || "0.9"} months of runway remaining.\n\n• Consider reducing non-essential expenses\n• Focus on revenue-generating activities\n• Plan fundraising activities soon\n\nRecommendation: Start fundraising conversations within the next 2-3 months to ensure sufficient runway during the process.`
    }
    
    if (promptLower.includes("revenue") || promptLower.includes("growth")) {
      return `Your MRR is currently $${context?.mrr?.toLocaleString() || "35,000"} with a ${context?.growth || "25"}% growth rate.\n\n• Strong month-over-month growth momentum\n• Focus on customer retention and expansion\n• Consider upselling to existing customers\n\nRecommendation: Maintain this growth rate to achieve profitability within 8-10 months.`
    }
    
    if (promptLower.includes("expense") || promptLower.includes("cost")) {
      return `Your current monthly burn rate is $${context?.monthlyBurn?.toLocaleString() || "82,000"}.\n\n• Payroll: ~60% of expenses\n• Marketing: ~20% of expenses\n• Infrastructure: ~15% of expenses\n• Other: ~5% of expenses\n\nRecommendation: Review marketing spend efficiency and consider optimizing infrastructure costs.`
    }
    
    return `I'm currently analyzing your financial data. Your key metrics:\n\n• Cash Balance: $${context?.cashBalance?.toLocaleString() || "70,000"}\n• Monthly Burn: $${context?.monthlyBurn?.toLocaleString() || "82,000"}\n• MRR: $${context?.mrr?.toLocaleString() || "35,000"}\n• Growth: ${context?.growth || "25"}%\n\nFeel free to ask specific questions about your runway, expenses, or growth strategies!`
  }

  async analyzeFinancialData(data: any, query: string): Promise<any> {
    const prompt = `You are Aura, an expert AI Chief Financial Officer (CFO) and financial advisor for startups and SMEs. You have deep expertise in:

• Cash flow management and runway forecasting
• Financial modeling and scenario planning
• Fundraising strategy and investor relations
• Expense optimization and cost management
• Revenue growth and unit economics
• Financial statements (P&L, Balance Sheet, Cash Flow)
• Strategic decision-making for early-stage companies

Your communication style is:
• Professional yet accessible
• Data-driven with specific numbers and metrics
• Action-oriented with clear recommendations
• Empathetic to the challenges founders face
• Concise but comprehensive

Current Financial Context:
• Cash Balance: $${data.cashBalance?.toLocaleString() || 'N/A'}
• Monthly Burn Rate: $${data.monthlyBurn?.toLocaleString() || 'N/A'}
• Runway: ${data.runway || 'N/A'} months
• Monthly Recurring Revenue (MRR): $${data.mrr?.toLocaleString() || 'N/A'}
• Growth Rate: ${data.growth || 'N/A'}%

User Question: ${query}

As a CFO, provide a strategic response that:
1. Directly answers the question with specific numbers
2. Identifies key financial insights or concerns
3. Provides 2-3 actionable recommendations
4. Explains the financial impact of your advice
5. Uses professional but clear language

Keep your response focused, practical, and under 300 words.`

    const response = await this.generateText(prompt)
    return this.parseFinancialResponse(response)
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
    if (!context) return prompt

    return `Context: You are Aura, an AI-powered virtual CFO assistant for startups and SMEs. You have access to the following financial data:

${JSON.stringify(context, null, 2)}

User Query: ${prompt}

Provide a helpful, specific, and actionable response based on the data.`
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
    // Server-side only - never exposed to client
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn("[Gemini] GEMINI_API_KEY not set in environment, using fallback responses")
      // Create a client with a dummy key - will use fallback responses
      geminiClient = new GeminiClient("fallback-mode")
    } else {
      console.log("[Gemini] API key found, initializing client with key:", apiKey.substring(0, 10) + "***")
      geminiClient = new GeminiClient(apiKey)
    }
  }
  return geminiClient
}

// Check if we're in fallback mode
export function isFallbackMode(): boolean {
  return !process.env.GEMINI_API_KEY
}
