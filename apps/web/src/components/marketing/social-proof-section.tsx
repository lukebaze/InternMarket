"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Upload, Quote } from "lucide-react";
import { stagger, fadeUp } from "./motion-variants";

const TESTIMONIALS = [
  {
    quote: "Replaced three internal tools with agents from InternMarket. Setup took 5 minutes.",
    name: "Sarah Chen",
    role: "Engineering Lead, Acme Corp",
  },
  {
    quote: "We went from zero to a full AI-powered workflow in one afternoon. Game changer.",
    name: "James Park",
    role: "VP Engineering, NovaTech",
  },
  {
    quote: "The trust scoring gives us confidence to adopt third-party agents in production.",
    name: "Priya Sharma",
    role: "CTO, DevFlow",
  },
];

export function SocialProofSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to API endpoint
    setSubmitted(true);
  }

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 border-t border-bg-border">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-5xl mx-auto flex flex-col items-center gap-16"
      >
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {TESTIMONIALS.map(({ quote, name, role }, i) => (
            <motion.div
              key={name}
              variants={fadeUp}
              className="flex flex-col gap-4 p-6 rounded-lg bg-bg-surface border border-bg-border"
            >
              <Quote className="w-5 h-5 text-lime/60" aria-hidden="true" />
              <p className="font-mono text-xs text-text-secondary leading-relaxed">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="mt-auto">
                <p className="font-ui text-sm font-semibold text-text-primary">{name}</p>
                <p className="font-mono text-[11px] text-text-muted">{role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live counter */}
        <motion.div variants={fadeUp} className="font-mono text-sm text-text-muted text-center">
          <span className="text-lime font-semibold">847</span> agents installed this week
        </motion.div>

        {/* Final CTA */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-8">
          <h2 className="font-ui text-3xl md:text-4xl font-semibold text-text-primary text-center">
            The agent economy starts here.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/agents"
              className="flex items-center gap-2 bg-lime text-black font-mono text-sm font-semibold px-6 py-3 rounded-md hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              Browse Agents
            </Link>
            <a
              href="#creators"
              className="flex items-center gap-2 font-mono text-sm text-text-primary px-6 py-3 rounded-md border border-bg-border bg-bg-surface hover:border-lime/50 transition-colors"
            >
              <Upload className="w-4 h-4 text-text-muted" />
              Start Selling
            </a>
          </div>

          {/* Waitlist */}
          {submitted ? (
            <p className="font-mono text-sm text-lime">You&rsquo;re on the list!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-md">
              <label htmlFor="waitlist-email" className="sr-only">Email address</label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 px-4 py-2.5 rounded-md bg-bg-surface border border-bg-border font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lime/50"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-md bg-lime/10 border border-lime/30 font-mono text-sm font-medium text-lime hover:bg-lime/20 transition-colors"
              >
                Join Waitlist
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
