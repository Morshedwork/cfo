'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type MascotState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'alert';

interface CFOMascotProps {
  state?: MascotState;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function CFOMascot({ state = 'idle', size = 'medium', className }: CFOMascotProps) {
  const [currentState, setCurrentState] = useState(state);

  useEffect(() => {
    setCurrentState(state);
  }, [state]);

  const sizes = {
    small: 64,
    medium: 120,
    large: 200,
  };

  const dimension = sizes[size];

  // Enhanced color scheme based on state
  const getColors = () => {
    switch (currentState) {
      case 'alert':
        return {
          primary: '#ef4444',
          secondary: '#fca5a5',
          glow: '#dc2626',
          accent: '#fee2e2',
        };
      case 'success':
        return {
          primary: '#10b981',
          secondary: '#6ee7b7',
          glow: '#059669',
          accent: '#d1fae5',
        };
      case 'listening':
        return {
          primary: '#06b6d4',
          secondary: '#67e8f9',
          glow: '#0891b2',
          accent: '#cffafe',
        };
      default:
        return {
          primary: '#14b8a6',
          secondary: '#5eead4',
          glow: '#0d9488',
          accent: '#ccfbf1',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={cn('relative inline-block', className)} style={{ width: dimension, height: dimension }}>
      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Enhanced Gradients and Filters */}
        <defs>
          {/* Glow Effects */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="blur" in2="SourceAlpha" operator="in" result="inner" />
            <feMerge>
              <feMergeNode in="inner" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Monitor/Screen Gradients */}
          <linearGradient id="monitorFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          
          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          
          <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
            <stop offset="70%" stopColor={colors.primary} stopOpacity="0.1" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </radialGradient>

          {/* Body Suit Gradients */}
          <linearGradient id="suitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          
          <linearGradient id="suitHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" stopOpacity="0" />
            <stop offset="50%" stopColor="#475569" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0" />
          </linearGradient>

          {/* Metal/Chrome Effects */}
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Tie Gradient */}
          <linearGradient id="tieGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.glow} />
          </linearGradient>

          {/* Shadow */}
          <radialGradient id="shadow">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="100" cy="210" rx="50" ry="8" fill="url(#shadow)" opacity="0.5" />
        
        {/* Antenna with better design */}
        <g className={cn(
          'transform-origin-center',
          currentState === 'listening' && 'animate-pulse'
        )}>
          {/* Antenna base */}
          <circle cx="100" cy="35" r="3" fill="url(#metalGradient)" />
          {/* Antenna rod */}
          <line
            x1="100"
            y1="20"
            x2="100"
            y2="35"
            stroke="url(#metalGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-sway"
          />
          {/* Antenna tip with glow */}
          <circle
            cx="100"
            cy="18"
            r="5"
            fill={colors.primary}
            filter="url(#glow)"
          />
          <circle
            cx="100"
            cy="18"
            r="3"
            fill={colors.secondary}
            className={cn(
              currentState === 'listening' && 'animate-ping'
            )}
          />
        </g>

        {/* Head/Monitor - Enhanced Professional Design */}
        <g className={cn(
          'transform-origin-center',
          currentState === 'thinking' && 'animate-wiggle'
        )}>
          {/* Monitor Frame with depth */}
          <rect
            x="55"
            y="35"
            width="90"
            height="70"
            rx="10"
            fill="url(#monitorFrame)"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          {/* Monitor inner frame */}
          <rect
            x="58"
            y="38"
            width="84"
            height="64"
            rx="8"
            fill="#1e293b"
          />
          {/* Bezel highlight */}
          <rect
            x="58"
            y="38"
            width="84"
            height="3"
            rx="8"
            fill="#475569"
            opacity="0.6"
          />
          
          {/* Screen */}
          <rect
            x="63"
            y="43"
            width="74"
            height="54"
            rx="6"
            fill="url(#screenGradient)"
          />
          {/* Screen glow */}
          <rect
            x="63"
            y="43"
            width="74"
            height="54"
            rx="6"
            fill="url(#screenGlow)"
          />
          {/* Screen reflection */}
          <rect
            x="65"
            y="45"
            width="30"
            height="15"
            rx="3"
            fill="#ffffff"
            opacity="0.05"
          />

          {/* Eyes/Charts based on state */}
          {currentState === 'idle' && (
            <>
              <circle cx="85" cy="70" r="6" fill={colors.primary} className="animate-pulse-slow" />
              <circle cx="115" cy="70" r="6" fill={colors.primary} className="animate-pulse-slow" />
              {/* Financial Chart Line */}
              <polyline
                points="75,80 85,75 95,78 105,72 115,76 125,70"
                stroke={colors.secondary}
                strokeWidth="2"
                fill="none"
                className="animate-draw"
              />
            </>
          )}

          {currentState === 'listening' && (
            <>
              <circle cx="85" cy="70" r="8" fill={colors.primary} className="animate-pulse" />
              <circle cx="115" cy="70" r="8" fill={colors.primary} className="animate-pulse" />
              {/* Sound Waves */}
              <g className="animate-pulse">
                <path d="M 75 80 Q 100 75 125 80" stroke={colors.secondary} strokeWidth="2" fill="none" />
                <path d="M 75 85 Q 100 80 125 85" stroke={colors.secondary} strokeWidth="1.5" fill="none" opacity="0.7" />
              </g>
            </>
          )}

          {currentState === 'thinking' && (
            <>
              <circle cx="85" cy="70" r="6" fill={colors.primary}>
                <animate attributeName="cx" values="85;90;85" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="115" cy="70" r="6" fill={colors.primary}>
                <animate attributeName="cx" values="115;110;115" dur="1.5s" repeatCount="indefinite" />
              </circle>
              {/* Loading Dots */}
              <circle cx="85" cy="82" r="2" fill={colors.secondary}>
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0s" />
              </circle>
              <circle cx="95" cy="82" r="2" fill={colors.secondary}>
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.2s" />
              </circle>
              <circle cx="105" cy="82" r="2" fill={colors.secondary}>
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.4s" />
              </circle>
            </>
          )}

          {currentState === 'speaking' && (
            <>
              <circle cx="85" cy="70" r="6" fill={colors.primary} />
              <circle cx="115" cy="70" r="6" fill={colors.primary} />
              {/* Animated Chart Bars */}
              <g className="animate-pulse-fast">
                <rect x="75" y="85" width="4" height="8" fill={colors.secondary} rx="1">
                  <animate attributeName="height" values="8;12;8" dur="0.6s" repeatCount="indefinite" />
                </rect>
                <rect x="85" y="80" width="4" height="13" fill={colors.secondary} rx="1">
                  <animate attributeName="height" values="13;8;13" dur="0.6s" repeatCount="indefinite" begin="0.15s" />
                </rect>
                <rect x="95" y="82" width="4" height="11" fill={colors.secondary} rx="1">
                  <animate attributeName="height" values="11;15;11" dur="0.6s" repeatCount="indefinite" begin="0.3s" />
                </rect>
                <rect x="105" y="78" width="4" height="15" fill={colors.secondary} rx="1">
                  <animate attributeName="height" values="15;10;15" dur="0.6s" repeatCount="indefinite" begin="0.45s" />
                </rect>
                <rect x="115" y="83" width="4" height="10" fill={colors.secondary} rx="1">
                  <animate attributeName="height" values="10;14;10" dur="0.6s" repeatCount="indefinite" begin="0.6s" />
                </rect>
              </g>
            </>
          )}

          {currentState === 'success' && (
            <>
              <circle cx="85" cy="68" r="4" fill={colors.primary} />
              <circle cx="115" cy="68" r="4" fill={colors.primary} />
              {/* Happy Smile - Checkmark */}
              <path
                d="M 80 80 L 95 88 L 120 72"
                stroke={colors.primary}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                className="animate-draw-check"
              />
            </>
          )}

          {currentState === 'alert' && (
            <>
              <circle cx="85" cy="70" r="6" fill={colors.primary} />
              <circle cx="115" cy="70" r="6" fill={colors.primary} />
              {/* Alert Symbol */}
              <g className="animate-pulse-fast">
                <text x="100" y="88" fontSize="20" fill={colors.primary} textAnchor="middle" fontWeight="bold">!</text>
              </g>
            </>
          )}

          {/* Smile/Mouth Indicator */}
          {(currentState === 'idle' || currentState === 'speaking') && (
            <path
              d="M 85 88 Q 100 92 115 88"
              stroke={colors.primary}
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          )}
        </g>

        {/* Body - Professional Business Suit */}
        <g>
          {/* Neck/Collar */}
          <rect x="90" y="105" width="20" height="12" rx="2" fill="url(#suitGradient)" />
          <path
            d="M 90 105 L 80 115 L 85 120 M 110 105 L 120 115 L 115 120"
            stroke="#cbd5e1"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
          
          {/* Shirt/White Collar */}
          <path
            d="M 92 108 L 95 118 L 105 118 L 108 108 Z"
            fill="#f1f5f9"
          />
          
          {/* Suit Jacket Body */}
          <path
            d="M 65 115 L 85 112 L 100 110 L 115 112 L 135 115 L 138 170 Q 138 178 132 178 L 68 178 Q 62 178 62 170 Z"
            fill="url(#suitGradient)"
          />
          
          {/* Suit lapels with gradient */}
          <path
            d="M 85 112 L 95 125 L 100 145"
            stroke="#1e293b"
            strokeWidth="15"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 115 112 L 105 125 L 100 145"
            stroke="#1e293b"
            strokeWidth="15"
            fill="none"
            opacity="0.6"
          />
          
          {/* Suit highlight */}
          <rect
            x="68"
            y="120"
            width="64"
            height="50"
            rx="2"
            fill="url(#suitHighlight)"
            opacity="0.3"
          />
          
          {/* Buttons */}
          <circle cx="100" cy="130" r="2.5" fill="#94a3b8" />
          <circle cx="100" cy="145" r="2.5" fill="#94a3b8" />
          <circle cx="100" cy="160" r="2.5" fill="#94a3b8" />
          
          {/* Tie - Professional */}
          <path
            d="M 100 110 L 97 122 L 100 152 L 103 122 Z"
            fill="url(#tieGradient)"
            filter="url(#innerGlow)"
          />
          {/* Tie knot */}
          <ellipse cx="100" cy="115" rx="4" ry="3" fill={colors.glow} />
          
          {/* Percentage Badge - Premium Design */}
          <circle cx="122" cy="135" r="10" fill={colors.glow} filter="url(#glow)" />
          <circle cx="122" cy="135" r="8" fill={colors.primary} />
          <text x="122" y="140" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">%</text>
          
          {/* Suit pocket square */}
          <rect x="115" y="120" width="8" height="6" rx="1" fill={colors.secondary} opacity="0.6" />
          
          {/* Suit edges/seams */}
          <line x1="85" y1="112" x2="82" y2="170" stroke="#475569" strokeWidth="1.5" opacity="0.4" />
          <line x1="115" y1="112" x2="118" y2="170" stroke="#475569" strokeWidth="1.5" opacity="0.4" />
        </g>

        {/* Arms - More Detailed */}
        <g>
          {/* Left Arm */}
          <rect x="48" y="125" width="18" height="45" rx="5" fill="url(#suitGradient)" />
          {/* Left arm highlight */}
          <rect x="49" y="125" width="6" height="40" rx="3" fill="#334155" opacity="0.3" />
          {/* Left sleeve cuff */}
          <rect x="48" y="165" width="18" height="5" rx="2" fill="#475569" />
          
          {/* Right Arm */}
          <rect x="134" y="125" width="18" height="45" rx="5" fill="url(#suitGradient)" />
          {/* Right arm shadow */}
          <rect x="145" y="125" width="6" height="40" rx="3" fill="#020617" opacity="0.4" />
          {/* Right sleeve cuff */}
          <rect x="134" y="165" width="18" height="5" rx="2" fill="#475569" />
        </g>

        {/* Legs - Better Proportions */}
        <g>
          {/* Left Leg */}
          <rect x="78" y="178" width="18" height="28" rx="3" fill="url(#suitGradient)" />
          {/* Left leg crease */}
          <line x1="87" y1="178" x2="87" y2="206" stroke="#020617" strokeWidth="1.5" opacity="0.3" />
          
          {/* Right Leg */}
          <rect x="104" y="178" width="18" height="28" rx="3" fill="url(#suitGradient)" />
          {/* Right leg crease */}
          <line x1="113" y1="178" x2="113" y2="206" stroke="#020617" strokeWidth="1.5" opacity="0.3" />
          
          {/* Shoes - Professional */}
          <ellipse cx="87" cy="207" rx="10" ry="5" fill="#1e293b" />
          <ellipse cx="87" cy="206" rx="9" ry="4" fill="#0f172a" />
          <ellipse cx="113" cy="207" rx="10" ry="5" fill="#1e293b" />
          <ellipse cx="113" cy="206" rx="9" ry="4" fill="#0f172a" />
          {/* Shoe highlights */}
          <ellipse cx="84" cy="205" rx="3" ry="1.5" fill="#475569" opacity="0.6" />
          <ellipse cx="110" cy="205" rx="3" ry="1.5" fill="#475569" opacity="0.6" />
        </g>
      </svg>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes draw {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; }
          to { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        @keyframes draw-check {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; }
          to { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        .animate-sway {
          animation: sway 3s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-fast {
          animation: pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-draw {
          stroke-dasharray: 100;
          stroke-dashoffset: 0;
          animation: draw 2s ease-in-out infinite;
        }
        .animate-draw-check {
          stroke-dasharray: 100;
          stroke-dashoffset: 0;
          animation: draw-check 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

