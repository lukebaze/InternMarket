"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Upload, Quote } from "lucide-react";
import { stagger, fadeUp } from "./motion-variants";

const TESTIMONIALS = [
  {
    quote: "Replaced three internal tools with interns from InternMarket. Setup took 5 minutes.",
    name: "Sarah Chen",
    role: "Engineering Lead, Acme Corp",
  },
  {
    quote: "We went from zero to a full AI-powered workflow in one afternoon. Game changer.",
    name: "James Park",
    role: "VP Engineering, NovaTech",
  },
  {
    quote: "The trust scoring gives us confidence to adopt third-party interns in production.",
    name: "Priya Sharma",
    role: "CTO, DevFlow",
  },
];

export function SocialProofSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
      } else if (res.status === 409) {
        setStatus("success"); // treat duplicate as success for UX
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error");
      setStatus("error");
    }
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

        {/* Testimonial disclaimer */}
        <motion.p variants={fadeUp} className="font-mono text-[10px] text-text-muted italic text-center">
          Testimonials represent the vision for InternMarket.
        </motion.p>

        {/* Early access badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-lime/30 bg-lime/5">
          <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          <span className="font-mono text-xs text-lime font-medium">Early Access — Limited Beta</span>
        </motion.div>

        {/* Final CTA */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-8">
          <h2 className="font-ui text-3xl md:text-4xl font-semibold text-text-primary text-center">
            The AI intern economy starts here.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/agents"
              className="flex items-center gap-2 bg-lime text-black font-mono text-sm font-semibold px-6 py-3 rounded-md hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              Browse Interns
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
          {status === "success" ? (
            <p className="font-mono text-sm text-lime">You&rsquo;re on the list!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 w-full max-w-md">
              <div className="flex items-center gap-2 w-full">
                <label htmlFor="waitlist-email" className="sr-only">Email address</label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  disabled={status === "loading"}
                  className="flex-1 px-4 py-2.5 rounded-md bg-bg-surface border border-bg-border font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lime/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-5 py-2.5 rounded-md bg-lime/10 border border-lime/30 font-mono text-sm font-medium text-lime hover:bg-lime/20 transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? "Joining..." : "Join Waitlist"}
                </button>
              </div>
              {status === "error" && (
                <p className="font-mono text-xs text-red-400">{errorMsg}</p>
              )}
            </form>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
