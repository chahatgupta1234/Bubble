'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [isBurst, setIsBurst] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef(null)
  const bubbleRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const bubbleSize = useTransform(scrollYProgress, [0, 0.9], ['16rem', '48rem'])
  const bubbleScale = useTransform(scrollYProgress, [0, 0.9, 1], [1, 1.2, 0])
  const bubbleOpacity = useTransform(scrollYProgress, [0, 0.9, 0.95, 1], [0.8, 0.8, 0.4, 0])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let scrollTimeout

    const handleScroll = () => {
      setIsScrolling(true)
      clearTimeout(scrollTimeout)

      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const maxScroll = documentHeight - windowHeight
      const scrollPercentage = scrollPosition / maxScroll

      if (scrollPercentage >= 0.95) {
        setIsBurst(true)
      } else if (scrollPercentage < 0.9) {
        setIsBurst(false)
      }

      scrollTimeout = setTimeout(() => setIsScrolling(false), 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  useEffect(() => {
    let animationId
    const floatAnimation = () => {
      if (!isScrolling && !isBurst) {
        const time = Date.now() * 0.001
        const x = Math.sin(time) * 100 // Diagonal movement along X-axis
        const y = Math.cos(time) * 100 // Diagonal movement along Y-axis
        mouseX.set(x)
        mouseY.set(y)
      } else {
        mouseX.set(0)
        mouseY.set(0)
      }
      animationId = requestAnimationFrame(floatAnimation)
    }
    animationId = requestAnimationFrame(floatAnimation)
    return () => cancelAnimationFrame(animationId)
  }, [mouseX, mouseY, isScrolling, isBurst])

  const renderDroplets = () => {
    return [...Array(20)].map((_, index) => (
      <motion.div
        key={index}
        className="absolute rounded-full bg-blue-300 opacity-80"
        style={{
          width: `${Math.random() * 10 + 5}px`,
          height: `${Math.random() * 10 + 5}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`
        }}
        animate={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 1.5, delay: index * 0.1 }}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          className="relative w-48 h-48"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              style={{
                border: '2px solid #c5ff00',
                borderRadius: '50%',
                width: '100%',
                height: '100%',
                transform: `scale(${1 - index * 0.15})`,
              }}
              animate={{
                rotate: 360,
                scale: [1 - index * 0.15, 1.2 - index * 0.15, 1 - index * 0.15],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: index * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    )
  }

  // Function to calculate distance between bubble and text
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  return (
    <div ref={containerRef} className="relative min-h-[400vh]">
      <AnimatePresence>
        {!isBurst && (
          <motion.div
            ref={bubbleRef}
            className="fixed top-1/2 left-1/2 pointer-events-none z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: [1, 1.2, 0],
              opacity: [1, 1, 0],
              transition: { duration: 0.5 }
            }}
            style={{
              width: bubbleSize,
              height: bubbleSize,
              x: mouseX,
              y: mouseY,
              scale: bubbleScale,
              opacity: bubbleOpacity,
            }}
          >
            <div className="relative w-full h-full">
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-white/20 to-transparent backdrop-blur-md border border-white/30" 
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 100%)'
                }}
              />
              <div 
                className="absolute inset-0 rounded-full opacity-80"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isBurst && (
        <div className="absolute inset-0 overflow-hidden z-50 pointer-events-none">
          {renderDroplets()}
        </div>
      )}

      {['Not sorry to interrupt.', "Rouser's activism makes people think.", 'Change only happens when everyone is paying attention.', 'Get noisy as hell, our lives depend on it.'].map((text, index) => (
        <section
          key={index}
          className={`h-screen flex items-center justify-center ${index % 2 === 0 ? 'bg-black' : 'bg-[#e4c1c1]'} p-8`}
        >
          <motion.h1
            className="text-[#c5ff00] text-7xl md:text-8xl font-bold max-w-4xl"
            style={{
              scale: calculateDistance(mouseX.get(), mouseY.get(), 0, 0) < 100 ? 1.5 : 1 // Enlarge when bubble is near
            }}
          >
            {text}
          </motion.h1>
        </section>
      ))}
    </div>
  )
}