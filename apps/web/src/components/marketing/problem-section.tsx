"use client";

import { motion } from "framer-motion";
import { Lock, ShieldOff, CircleDollarSign } from "lucide-react";
import { stagger, fadeUp } from "./motion-variants";

const PAINS = [
  {
    icon: Lock,
    title: "AI interns are trapped in local repos",
    desc: "Great interns sit in private GitHub repos with no way to reach the developers who need them.",
  },
  {
    icon: ShieldOff,
    title: "No way to verify what an intern does",
    desc: "You're running untrusted code with full system access. There's no review, no audit, no safety net.",
  },
  {
    icon: CircleDollarSign,
    title: "Creators have no path to monetize",
    desc: "Building AI interns is hard. Getting paid for them? Currently impossible without rolling your own infra.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 border-t border-bg-border">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-5xl mx-auto flex flex-col items-center gap-12"
      >
        <motion.h2
          variants={fadeUp}
          className="font-ui text-3xl md:text-4xl font-semibold text-text-primary text-center"
        >
          The Problem
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {PAINS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex flex-col gap-4 p-6 rounded-lg bg-bg-surface border border-bg-border"
            >
              <Icon className="w-8 h-8 text-red-error/80" />
              <h3 className="font-ui text-base font-semibold text-text-primary">{title}</h3>
              <p className="font-mono text-xs text-text-tertiary leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={fadeUp}
          className="font-ui text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lime to-[#99ff00] text-center"
        >
          InternMarket fixes that.
        </motion.p>
      </motion.div>
    </section>
  );
}
