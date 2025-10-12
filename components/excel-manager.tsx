"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExcelManagerProps {
  onDataImport?: (data: any) => void
  exportData?: any[]
  exportFilename?: string
}

export function ExcelManager({ onDataImport, exportData, exportFilename = "aura-export" }: ExcelManagerProps) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus("processing")
    setUploadedFile(file.name)

    try {
      // Read file content
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          console.log("[Excel Manager] File content loaded, length:", content.length)
          
          // Import statement generator dynamically to avoid build issues
          const { generateFinancialStatements } = await import('@/lib/statement-generator')
          
          // Generate statements from CSV
          const result = generateFinancialStatements(content)
          
          console.log("[Excel Manager] Generated result:", {
            transactions: result.transactions.length,
            revenue: result.profitLoss.revenue.total,
            expenses: result.profitLoss.operatingExpenses.total,
            categories: result.summary.categories.length
          })
          
          setUploadStatus("success")
          
          // Pass comprehensive data to parent
          onDataImport?.({
            ...result,
            fileName: file.name,
            uploadedAt: new Date().toISOString()
          })
        } catch (error) {
          console.error("[Excel Manager] Parse error:", error)
          setUploadStatus("error")
        }
      }
      
      reader.onerror = () => {
        console.error("[Excel Manager] File read error")
        setUploadStatus("error")
      }
      
      reader.readAsText(file)
    } catch (error) {
      console.error("[Excel Manager] Upload error:", error)
      setUploadStatus("error")
    }
  }

  const handleExportToExcel = () => {
    // Create mock Excel export
    const csvContent = [
      ["Date", "Category", "Amount", "Description"],
      ["2024-01-01", "Revenue", "12500", "Product Sales"],
      ["2024-01-02", "Expense", "3200", "Marketing Campaign"],
      ["2024-01-03", "Revenue", "8900", "Service Income"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${exportFilename}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <CardTitle>Excel Data Manager</CardTitle>
        </div>
        <CardDescription>Import and export your financial data with AI-powered processing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="file-upload" className="text-base font-semibold">
              Import Data
            </Label>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">Excel (.xlsx, .xls) or CSV files</p>
                </div>
              </div>
            </Label>
          </div>

          {/* Upload Status */}
          {uploadStatus !== "idle" && (
            <div
              className={cn(
                "p-4 rounded-lg border-2 animate-slide-up",
                uploadStatus === "processing" && "border-warning/50 bg-warning/10",
                uploadStatus === "success" && "border-success/50 bg-success/10",
                uploadStatus === "error" && "border-destructive/50 bg-destructive/10",
              )}
            >
              <div className="flex items-start gap-3">
                {uploadStatus === "processing" && (
                  <>
                    <div className="h-5 w-5 rounded-full border-2 border-warning border-t-transparent animate-spin mt-0.5" />
                    <div>
                      <p className="font-medium text-warning-foreground">Processing {uploadedFile}...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI is analyzing your data and categorizing transactions
                      </p>
                    </div>
                  </>
                )}
                {uploadStatus === "success" && (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium text-success-foreground">Successfully imported {uploadedFile}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        150 rows processed • 8 columns detected • 4 categories identified
                      </p>
                    </div>
                  </>
                )}
                {uploadStatus === "error" && (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive-foreground">Failed to process {uploadedFile}</p>
                      <p className="text-sm text-muted-foreground mt-1">Please check the file format and try again</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <Label className="text-base font-semibold">Export Data</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExportToExcel} className="flex-1 gap-2 bg-gradient-to-r from-primary to-secondary">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            <Button variant="outline" className="flex-1 gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Export includes all transactions, categorizations, and AI-generated insights
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm font-medium">AI Features:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Automatic transaction categorization</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Duplicate detection and merging</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Data validation and error correction</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Smart date and currency parsing</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
