"use client";

import { motion } from "framer-motion";
import { Package, Upload, DollarSign, TrendingUp, Quote } from "lucide-react";
import { stagger, fadeUp } from "./motion-variants";

const STATS = [
  { value: "10K+", label: "Creators" },
  { value: "$2M+", label: "Earned" },
  { value: "50K+", label: "Installs" },
];

const STEPS = [
  { icon: Package, title: "Package", desc: "Bundle your CLAUDE.md, tools, and prompts" },
  { icon: Upload, title: "Publish", desc: "Push to the registry with one command" },
  { icon: DollarSign, title: "Price", desc: "Set per-call, subscription, or free tier" },
  { icon: TrendingUp, title: "Profit", desc: "Earn on every install and API call" },
];

const MODELS = [
  { title: "Per-Call", desc: "Charge per invocation. Best for utility agents." },
  { title: "Subscription", desc: "Monthly access. Best for premium toolkits." },
  { title: "Freemium", desc: "Free tier + paid features. Best for growth." },
];

export function CreatorsSection() {
  return (
    <section id="creators" className="py-20 md:py-28 px-6 md:px-12 border-t border-bg-border scroll-mt-16">
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
            For Creators
          </span>
          <h2 className="font-ui text-3xl md:text-4xl font-semibold text-text-primary max-w-xl">
            You already built the best agent. Now let it earn.
          </h2>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp} className="flex gap-6 md:gap-10">
          {STATS.map(({ value, label }, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="font-ui text-2xl md:text-3xl font-bold text-lime">{value}</span>
              <span className="font-mono text-xs text-text-muted">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* 4-step process */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex flex-col items-center gap-3 p-5 rounded-lg bg-bg-surface border border-bg-border text-center"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-md bg-lime/10">
                <Icon className="w-5 h-5 text-lime" />
              </div>
              <h3 className="font-ui text-sm font-semibold text-text-primary">{title}</h3>
              <p className="font-mono text-[11px] text-text-tertiary leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Monetization models */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider">
            Monetization Models
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MODELS.map(({ title, desc }, i) => (
              <div
                key={i}
                className="px-5 py-4 rounded-lg border border-bg-border hover:border-lime/30 transition-colors"
              >
                <h4 className="font-ui text-sm font-semibold text-text-primary mb-1">{title}</h4>
                <p className="font-mono text-[11px] text-text-tertiary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          variants={fadeUp}
          className="flex gap-4 p-6 rounded-lg bg-bg-surface border border-bg-border max-w-2xl"
        >
          <Quote className="w-5 h-5 text-lime/60 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-text-secondary leading-relaxed">
              &ldquo;Published my agent on Monday, had 200 installs by Friday. The distribution
              problem is finally solved.&rdquo;
            </p>
            <p className="font-mono text-[11px] text-text-muted">
              Marcus Rivera, Independent Creator
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
