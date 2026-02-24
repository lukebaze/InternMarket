/**
 * permission-checklist.tsx — interactive permission review component
 * Shows required permissions for an intern and prompts Y/n to accept.
 */
import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface PermissionChecklistProps {
  permissions: string[];
  internName: string;
  /** Called with true (accepted) or false (rejected) */
  onResult: (accepted: boolean) => void;
}

export function PermissionChecklist({
  permissions,
  internName,
  onResult,
}: PermissionChecklistProps) {
  const [answered, setAnswered] = useState(false);

  useInput((input, key) => {
    if (answered) return;
    if (input.toLowerCase() === "y" || key.return) {
      setAnswered(true);
      onResult(true);
    } else if (input.toLowerCase() === "n") {
      setAnswered(true);
      onResult(false);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {internName}
        </Text>
        <Text> — Permissions Required</Text>
      </Box>

      {permissions.length === 0 ? (
        <Text color="gray">  No special permissions required.</Text>
      ) : (
        permissions.map((p, i) => (
          <Box key={i}>
            <Text color="yellow">  [x] </Text>
            <Text>{p}</Text>
          </Box>
        ))
      )}

      {!answered && (
        <Box marginTop={1}>
          <Text color="white">Accept permissions? </Text>
          <Text color="green" bold>
            [Y/n]
          </Text>
        </Box>
      )}

      {answered && (
        <Box marginTop={1}>
          <Text color="green">Permissions accepted.</Text>
        </Box>
      )}
    </Box>
  );
}
