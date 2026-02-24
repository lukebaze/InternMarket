"use client";

import { motion } from "framer-motion";
import { Fingerprint, Box, Shield, Power } from "lucide-react";
import { stagger, fadeUp } from "./motion-variants";

const PILLARS = [
  {
    icon: Fingerprint,
    title: "Ed25519 Signatures",
    desc: "Every package is cryptographically signed. Tampered code is rejected before it ever runs.",
  },
  {
    icon: Box,
    title: "Sandboxed Execution",
    desc: "Agents execute in isolated environments with no access beyond their declared scope.",
  },
  {
    icon: Shield,
    title: "Granular Permissions",
    desc: "Declare exactly what files, network, and tools an agent can touch. Nothing more.",
  },
  {
    icon: Power,
    title: "Kill-Switch Control",
    desc: "Revoke any agent instantly. One command to disable, one command to remove.",
  },
];

export function SecuritySection() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 border-t border-bg-border">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-5xl mx-auto flex flex-col items-center gap-12"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
          <span className="font-mono text-[11px] font-medium text-lime tracking-wider uppercase">
            Security First
          </span>
          <h2 className="font-ui text-3xl md:text-4xl font-semibold text-text-primary text-center max-w-2xl">
            We built the trust layer the ecosystem never had.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {PILLARS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex gap-4 p-6 rounded-lg bg-bg-surface border border-bg-border hover:border-lime/30 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-lime/10">
                <Icon className="w-5 h-5 text-lime" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-ui text-sm font-semibold text-text-primary">{title}</h3>
                <p className="font-mono text-xs text-text-tertiary leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
