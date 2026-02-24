"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Sparkles, Upload } from "lucide-react";
import { TerminalAnimation } from "./terminal-animation";

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

const STATS = ["1,200+ agents", "50k+ installs", "4.8 avg rating"];

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] py-20 px-6 md:px-12 bg-bg-page overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-lime/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/6 rounded-full blur-[140px]" />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center gap-7 max-w-4xl"
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-bg-border bg-bg-surface/80 backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-lime shadow-[0_0_8px_rgba(191,255,0,0.8)]"
          />
          <span className="font-mono text-[11px] font-medium text-text-secondary tracking-wider uppercase">
            The Agent Economy Is Here
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-1">
          <h1 className="font-ui text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-semibold text-text-primary text-center leading-[1.08] tracking-tight">
            The App Store for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime via-[#99ff00] to-blue-400">
              Claude Code Agents
            </span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="font-mono text-sm md:text-base text-text-tertiary text-center leading-relaxed max-w-[640px]"
        >
          Discover &amp; install agents in one command. Publish &amp; monetize yours in minutes.
        </motion.p>

        {/* Terminal */}
        <motion.div variants={fadeUp}>
          <TerminalAnimation commands={["internmarket install marketing-genius"]} />
        </motion.div>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 mt-1">
          <Link
            href="/agents"
            className="group relative flex items-center gap-2 bg-lime text-black font-mono text-sm font-semibold px-6 py-3 rounded-md overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(191,255,0,0.3)]"
          >
            <Sparkles className="w-4 h-4" />
            Browse Agents
          </Link>
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 font-mono text-sm text-text-primary px-6 py-3 rounded-md border border-bg-border bg-bg-surface hover:border-lime/50 transition-all"
          >
            <Upload className="w-4 h-4 text-text-muted group-hover:text-lime transition-colors" />
            Start Selling
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-6 mt-4 font-mono text-xs text-text-muted"
        >
          {STATS.map((s, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-text-muted" />}
              {s}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
