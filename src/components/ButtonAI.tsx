"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

//  ------------------------------ | BUTTON AI | ------------------------------  //

interface ButtonAIProps {
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  loading?: boolean
  idleText?: string
  thinkingText?: string
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function ButtonAI({
  type = "button",
  disabled = false,
  loading,
  idleText = "Generate",
  thinkingText = "Thinking",
  className,
  onClick,
}: ButtonAIProps) {
  const [internalStatus, setInternalStatus] = useState<"idle" | "thinking">("idle")

  // Use controlled loading if provided, otherwise fallback to internal status
  const status = loading !== undefined ? (loading ? "thinking" : "idle") : internalStatus

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
    }

    if (loading === undefined && internalStatus === "idle") {
      setInternalStatus("thinking")
      setTimeout(() => {
        setInternalStatus("idle")
      }, 5000)
    }
  }

  // Dynamic width container based on text length to avoid awkward clipping
  const isLongText = idleText.length > 10 || thinkingText.length > 10
  const textWidthClass = isLongText ? "w-[125px] sm:w-[130px]" : "w-[75px]"

  return (
    <motion.button
      type={type}
      disabled={disabled || status === "thinking"}
      onClick={handleClick}
      layout
      className={cn(
        "relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full border px-6 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none select-none",
        status === "idle"
          ? "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          : "border-transparent bg-card text-primary",
        className
      )}
      whileHover={{ scale: status === "idle" && !disabled ? 1.02 : 1 }}
      whileTap={{ scale: status === "idle" && !disabled ? 0.98 : 1 }}
    >
      {/* Animated Gradient Border for Thinking State */}
      <AnimatePresence>
        {status === "thinking" && (
          <motion.div
            className="absolute inset-0 z-0 overflow-hidden rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Spinning Conic Gradient */}
            <motion.div
              className="absolute top-1/2 left-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 35%, var(--primary) 50%, transparent 65%, transparent 85%, var(--chart-2) 100%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
            {/* Inner Background Mask to create the border */}
            <div className="absolute inset-[1.5px] rounded-full bg-card" />

            {/* Soft inner glow - opacity separated to handle hex variable transparency */}
            <motion.div className="absolute inset-[1.5px] rounded-full opacity-20 shadow-[inset_0_0_12px_var(--primary)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
        <Sparkles
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            status === "idle" ? "text-muted-foreground" : "text-primary animate-pulse"
          )}
          fill="currentColor"
        />
      </div>

      <span className={cn("relative z-10 flex h-5 items-center justify-center overflow-hidden", textWidthClass)}>
        <AnimatePresence mode="wait">
          {status === "idle" ? (
            <motion.span
              key="generate-text"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute font-semibold tracking-wide whitespace-nowrap"
            >
              {idleText}
            </motion.span>
          ) : (
            <motion.span
              key="thinking-text"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute font-semibold tracking-wide whitespace-nowrap"
            >
              {thinkingText}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Outer Glow Effect behind the button when thinking */}
      <AnimatePresence>
        {status === "thinking" && (
          <motion.div
            className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-20 shadow-[0_0_20px_var(--primary)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}
