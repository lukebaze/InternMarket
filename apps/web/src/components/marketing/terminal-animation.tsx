"use client";

import { useState, useEffect } from "react";

export interface TerminalLine {
  text: string;
  /** true = user command (shows $ prompt), false = output (no prompt, dimmer) */
  isCommand?: boolean;
}

interface TerminalAnimationProps {
  lines: TerminalLine[];
  typingSpeed?: number;
  pauseBetween?: number;
}

export function TerminalAnimation({
  lines: inputLines,
  typingSpeed = 50,
  pauseBetween = 1200,
}: TerminalAnimationProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completed, setCompleted] = useState<TerminalLine[]>([]);

  const current = inputLines[lineIndex];
  const currentText = current?.text ?? "";
  const typedText = currentText.slice(0, charIndex);
  const isTyping = lineIndex < inputLines.length;

  useEffect(() => {
    if (!isTyping) return;

    // Output lines appear instantly (no typewriter)
    if (current && !current.isCommand) {
      const timeout = setTimeout(() => {
        setCompleted((prev) => [...prev, current]);
        if (lineIndex < inputLines.length - 1) {
          setLineIndex((i) => i + 1);
          setCharIndex(0);
        } else {
          setLineIndex(inputLines.length); // done
        }
      }, pauseBetween / 3);
      return () => clearTimeout(timeout);
    }

    if (isPaused) {
      const timeout = setTimeout(() => {
        setCompleted((prev) => [...prev, current!]);
        if (lineIndex < inputLines.length - 1) {
          setLineIndex((i) => i + 1);
          setCharIndex(0);
        } else {
          setLineIndex(inputLines.length); // done
        }
        setIsPaused(false);
      }, pauseBetween);
      return () => clearTimeout(timeout);
    }

    if (charIndex < currentText.length) {
      const timeout = setTimeout(
        () => setCharIndex((c) => c + 1),
        typingSpeed + Math.random() * 30,
      );
      return () => clearTimeout(timeout);
    }

    if (charIndex === currentText.length && currentText.length > 0) {
      setIsPaused(true);
    }
  }, [charIndex, lineIndex, current, currentText, inputLines.length, isPaused, isTyping, typingSpeed, pauseBetween]);

  return (
    <div className="w-full max-w-xl rounded-lg border border-bg-border bg-bg-surface overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border-b border-bg-border">
        <span className="w-3 h-3 rounded-full bg-red-500/80" aria-hidden="true" />
        <span className="w-3 h-3 rounded-full bg-amber-warning/80" aria-hidden="true" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" aria-hidden="true" />
        <span className="ml-3 font-mono text-[11px] text-text-muted">terminal</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 min-h-[80px] font-mono text-sm leading-relaxed">
        {/* Completed lines */}
        {completed.map((line, i) => (
          <div key={i} className="flex gap-2">
            {line.isCommand ? (
              <>
                <span className="text-lime select-none">$</span>
                <span className="text-text-primary">{line.text}</span>
              </>
            ) : (
              <span className="text-text-tertiary pl-4">{line.text}</span>
            )}
          </div>
        ))}

        {/* Active typing line (only for commands) */}
        {isTyping && current?.isCommand && (
          <div className="flex gap-2">
            <span className="text-lime select-none">$</span>
            <span className="text-text-primary">{typedText}</span>
            <span className="inline-block w-2 h-[18px] bg-lime translate-y-[2px] animate-pulse" aria-hidden="true" />
          </div>
        )}

        {/* Idle cursor after all lines done */}
        {!isTyping && (
          <div className="flex gap-2">
            <span className="text-lime select-none">$</span>
            <span className="inline-block w-2 h-[18px] bg-lime translate-y-[2px] animate-pulse" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
