/**
 * install-wizard.tsx — full TUI for intern install flow
 * Steps: info → permissions → downloading → extracting → done
 */
import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { ProgressBar } from "./progress-bar.js";
import { PermissionChecklist } from "./permission-checklist.js";

export type InstallStep =
  | "permissions"
  | "resolving"
  | "downloading"
  | "verifying"
  | "extracting"
  | "installing"
  | "done"
  | "error";

export interface InstallWizardState {
  step: InstallStep;
  internName: string;
  slug: string;
  version: string;
  creator?: string;
  verified?: boolean;
  permissions: string[];
  downloadPercent: number;
  errorMsg?: string;
}

interface InstallWizardProps extends InstallWizardState {
  onDone: () => void;
  onPermissionResult?: (accepted: boolean) => void;
}

const STEP_LABELS: Record<InstallStep, string> = {
  permissions: "Awaiting permission review...",
  resolving: "Resolving intern...",
  downloading: "Downloading...",
  verifying: "Verifying checksum...",
  extracting: "Extracting...",
  installing: "Installing...",
  done: "Installation complete!",
  error: "Installation failed",
};

const ACTIVE_STEPS: InstallStep[] = [
  "resolving",
  "downloading",
  "verifying",
  "extracting",
  "installing",
];

function StepRow({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <Box>
      {done && <Text color="green">  ✔ </Text>}
      {active && (
        <>
          <Text color="cyan">  </Text>
          <Spinner type="dots" />
          <Text> </Text>
        </>
      )}
      {!done && !active && <Text color="gray">  ○ </Text>}
      <Text color={done ? "green" : active ? "cyan" : "gray"}>{label}</Text>
    </Box>
  );
}

export function InstallWizard({
  step,
  internName,
  slug,
  version,
  creator,
  verified,
  permissions,
  downloadPercent,
  errorMsg,
  onDone,
  onPermissionResult,
}: InstallWizardProps) {
  // Auto-call onDone when step reaches done/error after a short delay
  useEffect(() => {
    if (step === "done" || step === "error") {
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  const currentStepIdx = ACTIVE_STEPS.indexOf(step as InstallStep);

  if (step === "permissions" && onPermissionResult) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1} borderStyle="round" borderColor="cyan" paddingX={1}>
          <Text bold color="cyan">{internName}</Text>
          <Text> v{version}</Text>
          {creator && <Text color="gray">  by @{creator}</Text>}
          {verified && <Text color="green">  ✔ Verified</Text>}
        </Box>
        <PermissionChecklist
          permissions={permissions}
          internName={internName}
          onResult={onPermissionResult}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
        <Text bold>Installing: </Text>
        <Text color="cyan">{internName}</Text>
        <Text> v{version}</Text>
        {creator && <Text color="gray">  by @{creator}</Text>}
        {verified && <Text color="green">  ✔ Verified</Text>}
      </Box>

      {/* Steps */}
      <Box flexDirection="column" marginBottom={1}>
        {ACTIVE_STEPS.map((s, i) => (
          <StepRow
            key={s}
            label={STEP_LABELS[s]}
            active={s === step}
            done={currentStepIdx > i || step === "done"}
          />
        ))}
      </Box>

      {/* Download progress bar */}
      {step === "downloading" && (
        <Box marginLeft={2} marginBottom={1}>
          <ProgressBar percent={downloadPercent} width={28} label="Downloading" />
        </Box>
      )}

      {/* Error */}
      {step === "error" && (
        <Box marginLeft={2}>
          <Text color="red">✖ {errorMsg ?? "Unknown error"}</Text>
        </Box>
      )}

      {/* Success */}
      {step === "done" && (
        <Box marginLeft={2}>
          <Text color="green">✔ Installed {slug}@{version}</Text>
        </Box>
      )}
    </Box>
  );
}
