"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { LivePreviewModal } from "./live-preview-modal"

interface FeaturePreviewProps {
  feature: {
    id: string
    title: string
    description: string
    icon: any
    preview: string
    color: string
  }
  autoPlayDelay?: number
}

export function FeaturePreview({ feature, autoPlayDelay = 0 }: FeaturePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false)

  // Auto-start preview animation after delay
  useEffect(() => {
    if (autoPlayDelay > 0 && !hasAutoPlayed) {
      const timer = setTimeout(() => {
        setIsPlaying(true)
        setHasAutoPlayed(true)
        
        // Auto-close after showing
        setTimeout(() => {
          setIsPlaying(false)
        }, 5000)
      }, autoPlayDelay)

      return () => clearTimeout(timer)
    }
  }, [autoPlayDelay, hasAutoPlayed])

  return (
    <>
      <Card className="relative overflow-hidden preview-card hover-glow group">
        <div className="preview-card-inner">
          {/* Preview Image/Video Area */}
          <div className="relative h-64 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 overflow-hidden">
            {!isPlaying ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn("text-8xl opacity-20", feature.color)}>
                    <feature.icon className="h-32 w-32" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="lg"
                    className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 animate-glow-pulse"
                    onClick={() => {
                      setIsPlaying(true)
                      setHasAutoPlayed(true)
                    }}
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
                {autoPlayDelay > 0 && !hasAutoPlayed && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                    <Sparkles className="h-3 w-3" />
                    Auto-preview starting...
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 bg-background/95 p-6 animate-scale-in">
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => setIsPlaying(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className={cn("inline-flex p-4 rounded-full animate-pulse-glow", feature.color)}>
                      <feature.icon className="h-12 w-12" />
                    </div>
                    <p className="text-lg font-semibold">{feature.preview}</p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="p-3 rounded-lg bg-muted animate-scale-in [animation-delay:0.1s]">
                        <div className="text-2xl font-bold text-primary">95%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted animate-scale-in [animation-delay:0.2s]">
                        <div className="text-2xl font-bold text-accent">2.5s</div>
                        <div className="text-xs text-muted-foreground">Response</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground animate-pulse">
              {isPlaying ? "Live Demo" : "Featured"}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", feature.color)}>
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
            <Button
              className="w-full mt-4 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-shift"
              onClick={() => setShowModal(true)}
            >
              Try Live Demo
            </Button>
          </div>
        </div>
      </Card>

      <LivePreviewModal isOpen={showModal} onClose={() => setShowModal(false)} featureId={feature.id} />
    </>
  )
}
