"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TerminalAnimationProps {
  commands: string[];
  typingSpeed?: number;
  pauseBetween?: number;
}

export function TerminalAnimation({
  commands,
  typingSpeed = 50,
  pauseBetween = 1200,
}: TerminalAnimationProps) {
  const [cmdIndex, setCmdIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const currentCommand = commands[cmdIndex] ?? "";
  const typedText = currentCommand.slice(0, charIndex);

  useEffect(() => {
    if (isPaused) {
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev, currentCommand]);
        if (cmdIndex < commands.length - 1) {
          setCmdIndex((i) => i + 1);
          setCharIndex(0);
        }
        setIsPaused(false);
      }, pauseBetween);
      return () => clearTimeout(timeout);
    }

    if (charIndex < currentCommand.length) {
      const timeout = setTimeout(
        () => setCharIndex((c) => c + 1),
        typingSpeed + Math.random() * 30,
      );
      return () => clearTimeout(timeout);
    }

    // Finished typing current command
    if (charIndex === currentCommand.length && currentCommand.length > 0) {
      setIsPaused(true);
    }
  }, [charIndex, cmdIndex, currentCommand, commands.length, isPaused, typingSpeed, pauseBetween]);

  return (
    <div className="w-full max-w-xl rounded-lg border border-bg-border bg-bg-surface overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border-b border-bg-border">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-amber-warning/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-[11px] text-text-muted">terminal</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 min-h-[80px] font-mono text-sm leading-relaxed">
        {/* Completed lines */}
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-lime select-none">$</span>
            <span className="text-text-primary">{line}</span>
          </div>
        ))}

        {/* Active line */}
        {cmdIndex < commands.length && (
          <div className="flex gap-2">
            <span className="text-lime select-none">$</span>
            <span className="text-text-primary">{typedText}</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
              className="inline-block w-2 h-[18px] bg-lime translate-y-[2px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
