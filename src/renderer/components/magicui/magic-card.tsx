"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import React, { useCallback, useEffect, useRef } from "react";

import { cn } from "../../lib/utils";

interface MagicCardProps {
    children?: React.ReactNode
    className?: string
    gradientSize?: number
    gradientColor?: string
    gradientOpacity?: number
    gradientFrom?: string
    gradientTo?: string
    // New props for flipping
    flipInterval?: number
    frontContent?: React.ReactNode
    backContent?: React.ReactNode
    pauseOnHover?: boolean
  }
  
  export function MagicCard({
    children,
    className,
    gradientSize = 200,
    gradientColor = "#262626",
    gradientOpacity = 0.8,
    gradientFrom = "#9E7AFF",
    gradientTo = "#FE8BBB",
    flipInterval,
    frontContent,
    backContent,
    pauseOnHover = true,
  }: MagicCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(-gradientSize)
    const mouseY = useMotionValue(-gradientSize)
    const [isFlipped, setIsFlipped] = React.useState(false)
    const [isPaused, setIsPaused] = React.useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (cardRef.current) {
          const { left, top } = cardRef.current.getBoundingClientRect()
          const clientX = e.clientX
          const clientY = e.clientY
          mouseX.set(clientX - left)
          mouseY.set(clientY - top)
        }
      },
      [mouseX, mouseY],
    )
  
    const handleMouseOut = useCallback(
      (e: MouseEvent) => {
        if (!e.relatedTarget) {
          document.removeEventListener("mousemove", handleMouseMove)
          mouseX.set(-gradientSize)
          mouseY.set(-gradientSize)
        }
      },
      [handleMouseMove, mouseX, gradientSize, mouseY],
    )
  
    const handleMouseEnter = useCallback(() => {
      document.addEventListener("mousemove", handleMouseMove)
      if (pauseOnHover && flipInterval) {
        setIsPaused(true)
      }
    }, [handleMouseMove, pauseOnHover, flipInterval])
  
    const handleMouseLeave = useCallback(() => {
      if (pauseOnHover && flipInterval) {
        setIsPaused(false)
      }
    }, [pauseOnHover, flipInterval])
  
    // Auto-flip logic
    useEffect(() => {
      if (flipInterval && (frontContent || backContent)) {
        const startInterval = () => {
          intervalRef.current = setInterval(() => {
            if (!isPaused) {
              setIsFlipped((prev) => !prev)
            }
          }, flipInterval)
        }
  
        startInterval()
  
        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        }
      }
    }, [flipInterval, frontContent, backContent, isPaused])
  
    useEffect(() => {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseout", handleMouseOut)
      document.addEventListener("mouseenter", handleMouseEnter)
  
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseout", handleMouseOut)
        document.removeEventListener("mouseenter", handleMouseEnter)
      }
    }, [handleMouseEnter, handleMouseMove, handleMouseOut])
  
    useEffect(() => {
      mouseX.set(-gradientSize)
      mouseY.set(-gradientSize)
    }, [gradientSize, mouseX, mouseY])
  
    const shouldFlip = flipInterval && (frontContent || backContent)
  
    // Simple card implementation like the demo
    const CardSide = ({ content }: { content: React.ReactNode }) => (
      <>
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl bg-border opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
            ${gradientFrom}, 
            ${gradientTo}, 
            transparent 100%
            )
            `,
          }}
        />
        <div className="absolute inset-px rounded-xl bg-background" />
        <motion.div
          className="pointer-events-none absolute inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
            `,
            opacity: gradientOpacity,
          }}
        />
        <div className="relative">{content}</div>
      </>
    )
  
    if (!shouldFlip) {
      // Original behavior - no flipping, same as demo
      return (
        <div
          ref={cardRef}
          className={cn("group relative rounded-xl", className)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CardSide content={children} />
        </div>
      )
    }
  
    // Flipping behavior
    return (
      <div
        ref={cardRef}
        className={cn("group relative rounded-xl", className)}
        style={{
          perspective: "1000px",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <CardSide content={frontContent} />
          </div>
  
          {/* Back Side */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardSide content={backContent} />
          </div>
        </motion.div>
      </div>
    )
  }