"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { AgentCategory } from "@repo/types";
import {
  Megaphone, Bot, PenTool, Code,
  ClipboardList, TrendingUp, MessageCircle,
} from "lucide-react";

const CATEGORIES: { key: AgentCategory; label: string; count: number; icon: React.ElementType }[] = [
  { key: "marketing", label: "Marketing", count: 120, icon: Megaphone },
  { key: "assistant", label: "Assistant", count: 95, icon: Bot },
  { key: "copywriting", label: "Copywriting", count: 84, icon: PenTool },
  { key: "coding", label: "Coding", count: 210, icon: Code },
  { key: "pm", label: "PM", count: 67, icon: ClipboardList },
  { key: "trading", label: "Trading", count: 53, icon: TrendingUp },
  { key: "social", label: "Social", count: 72, icon: MessageCircle },
];

export function CategorySection() {
  return (
    <div>
      <h3 className="font-mono text-xs text-text-muted uppercase tracking-wider mb-4">
        Browse By Category
      </h3>
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map(({ key, label, count, icon: Icon }, i) => (
          <Link key={key} href={`/agents?category=${key}`}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-surface border border-bg-border hover:border-lime/50 transition-colors"
            >
              <Icon className="w-4 h-4 text-lime" />
              <span className="font-mono text-[11px] font-medium text-text-primary">{label}</span>
              <span className="font-mono text-[10px] text-text-muted">({count})</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
