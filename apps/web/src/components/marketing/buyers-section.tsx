"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Layers, RefreshCw, Quote } from "lucide-react";
import { TerminalAnimation } from "./terminal-animation";
import { CategorySection } from "./category-section";
import { stagger, fadeUp } from "./motion-variants";

const BENEFITS = [
  { icon: Zap, text: "Install any agent in seconds" },
  { icon: Shield, text: "Every package cryptographically verified" },
  { icon: Layers, text: "Works with your existing Claude Code setup" },
  { icon: RefreshCw, text: "Auto-updates keep you on latest version" },
];

const TERMINAL_LINES = [
  { text: "internmarket install marketing-genius", isCommand: true },
  { text: "resolving marketing-genius@1.2.0...", isCommand: false },
  { text: "✓ verified signature (ed25519)", isCommand: false },
  { text: "✓ installed to ~/.claude/agents/", isCommand: false },
  { text: "claude --agent marketing-genius", isCommand: true },
];

export function BuyersSection() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 border-t border-bg-border">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-5xl mx-auto flex flex-col gap-12"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <span className="font-mono text-[11px] font-medium text-lime tracking-wider uppercase">
            For Builders &amp; Teams
          </span>
          <h2 className="font-ui text-3xl md:text-4xl font-semibold text-text-primary">
            One command. Zero hassle. Full power.
          </h2>
        </motion.div>

        {/* Two-column: terminal + benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div variants={fadeUp}>
            <TerminalAnimation lines={TERMINAL_LINES} typingSpeed={35} pauseBetween={800} />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            {BENEFITS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md bg-lime/10">
                  <Icon className="w-4 h-4 text-lime" />
                </div>
                <span className="font-mono text-sm text-text-secondary">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Categories strip */}
        <motion.div variants={fadeUp}>
          <CategorySection />
        </motion.div>

        {/* Testimonial */}
        <motion.div
          variants={fadeUp}
          className="flex gap-4 p-6 rounded-lg bg-bg-surface border border-bg-border max-w-2xl"
        >
          <Quote className="w-5 h-5 text-lime/60 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-text-secondary leading-relaxed">
              &ldquo;I went from hearing about an agent to using it in production in under 60 seconds.
              That&rsquo;s never happened before.&rdquo;
            </p>
            <p className="font-mono text-[11px] text-text-muted">
              Alex Kim, Staff Engineer @ Vercel
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
