// Gemini API client for all AI features
export class GeminiClient {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateText(prompt: string, context?: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
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
            maxOutputTokens: 2048,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.candidates[0]?.content?.parts[0]?.text || "No response generated"
    } catch (error) {
      console.error("[v0] Gemini API error:", error)
      return "I apologize, but I'm having trouble processing your request. Please try again."
    }
  }

  async analyzeFinancialData(data: any, query: string): Promise<any> {
    const prompt = `You are a financial advisor AI. Analyze the following financial data and answer the query.

Financial Data:
${JSON.stringify(data, null, 2)}

Query: ${query}

Provide a detailed, actionable response with specific numbers and recommendations.`

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
      return {
        category: "Uncategorized",
        confidence: 50,
        type: amount < 0 ? "expense" : "revenue",
      }
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
      return {
        action: "query_data",
        data: {},
        message: "I couldn't understand that command. Please try again.",
      }
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
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }
    geminiClient = new GeminiClient(apiKey)
  }
  return geminiClient
}
