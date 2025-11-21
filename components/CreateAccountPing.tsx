'use client'

import { motion } from "framer-motion"

const LOOP_DURATION = 4
const SMALL_LOOP_DURATION = 2

const CreateAccountPing = () => {
  return (
    <div className="relative flex items-center justify-center py-24">
      <div className="relative">
        <AccountIcon />
        <Band delay={0} />
        <Band delay={LOOP_DURATION * 0.25} />
        <Band delay={LOOP_DURATION * 0.5} />
        <Band delay={LOOP_DURATION * 0.75} />
      </div>
    </div>
  )
}

// Small ping for button
export const SmallPing = () => {
  return (
    <div className="relative inline-flex h-3 w-3 mr-2">
      <motion.span
        animate={{
          opacity: [0.8, 0],
          scale: [1, 2.5],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: SMALL_LOOP_DURATION,
          ease: "easeOut",
        }}
        className="absolute inline-flex h-full w-full rounded-full bg-gray-900"
      />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-gray-900 shadow-lg"></span>
    </div>
  )
}

const AccountIcon = () => {
  return (
    <motion.div
      className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-2xl"
      initial={{
        opacity: 0,
        scale: 0.85,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 1,
        ease: "easeOut",
      }}
    >
      {/* User Plus Icon */}
      <svg
        className="h-12 w-12 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    </motion.div>
  )
}

const Band = ({ delay }: { delay: number }) => {
  return (
    <motion.span
      style={{
        translateX: "-50%",
        translateY: "-50%",
      }}
      initial={{
        opacity: 0,
        scale: 0.25,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: 1,
      }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        times: [0, 0.5, 0.75, 1],
        duration: LOOP_DURATION,
        ease: "linear",
        delay,
      }}
      className="absolute left-[50%] top-[50%] z-0 h-56 w-56 rounded-full border-[1px] border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl"
    />
  )
}

export default CreateAccountPing
