/**
 * progress-bar.tsx — animated download progress bar using Ink Box/Text
 * Shows filled/unfilled segments with percentage and label.
 */
import React from "react";
import { Box, Text } from "ink";

interface ProgressBarProps {
  /** 0–100 */
  percent: number;
  /** Width in terminal columns (default 30) */
  width?: number;
  label?: string;
}

export function ProgressBar({ percent, width = 30, label }: ProgressBarProps) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = "=".repeat(filled) + "-".repeat(empty);
  const pct = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <Box>
      <Text color="cyan">[</Text>
      <Text color="green">{bar}</Text>
      <Text color="cyan">]</Text>
      <Text> {String(pct).padStart(3)}%</Text>
      {label && <Text color="gray"> {label}</Text>}
    </Box>
  );
}
