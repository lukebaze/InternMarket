/**
 * publish-status.tsx — step-by-step publish tracker with checkmarks
 * Shows packaging → uploading → registering → published flow.
 */
import React, { useEffect } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";

export type PublishStep =
  | "packaging"
  | "uploading"
  | "registering"
  | "done"
  | "error";

export interface PublishStatusProps {
  step: PublishStep;
  slug: string;
  version: string;
  packageSize?: number;
  errorMsg?: string;
  onDone: () => void;
}

const STEPS: PublishStep[] = ["packaging", "uploading", "registering"];

const STEP_LABELS: Record<PublishStep, string> = {
  packaging: "Building package",
  uploading: "Uploading to InternMarket",
  registering: "Registering version",
  done: "Published",
  error: "Failed",
};

function StepRow({
  label,
  active,
  done,
  detail,
}: {
  label: string;
  active: boolean;
  done: boolean;
  detail?: string;
}) {
  return (
    <Box>
      {done && <Text color="green">  [✔] </Text>}
      {active && (
        <>
          <Text color="cyan">  [</Text>
          <Spinner type="dots" />
          <Text color="cyan">] </Text>
        </>
      )}
      {!done && !active && <Text color="gray">  [ ] </Text>}
      <Text color={done ? "green" : active ? "cyan" : "gray"}>{label}</Text>
      {detail && <Text color="gray"> ({detail})</Text>}
    </Box>
  );
}

export function PublishStatus({
  step,
  slug,
  version,
  packageSize,
  errorMsg,
  onDone,
}: PublishStatusProps) {
  useEffect(() => {
    if (step === "done" || step === "error") {
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  const currentIdx = STEPS.indexOf(step as PublishStep);

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
        <Text bold>Publishing: </Text>
        <Text color="cyan">{slug}</Text>
        <Text> v{version}</Text>
      </Box>

      {/* Steps */}
      <Box flexDirection="column" marginBottom={1}>
        {STEPS.map((s, i) => (
          <StepRow
            key={s}
            label={STEP_LABELS[s]}
            active={s === step}
            done={currentIdx > i || step === "done"}
            detail={s === "packaging" && packageSize ? `${(packageSize / 1024).toFixed(1)} KB` : undefined}
          />
        ))}
      </Box>

      {step === "done" && (
        <Box marginLeft={2}>
          <Text color="green" bold>
            ✔ Published {slug}@{version}
          </Text>
        </Box>
      )}

      {step === "error" && (
        <Box marginLeft={2}>
          <Text color="red">✖ {errorMsg ?? "Unknown error"}</Text>
        </Box>
      )}
    </Box>
  );
}
