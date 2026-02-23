#!/usr/bin/env node
import { Command } from "commander";
import { publishCommand } from "./commands/publish.js";
import { statusCommand } from "./commands/status.js";

const program = new Command();
program
  .name("interns")
  .description("Publish and manage AI agents on interns.market")
  .version("0.1.0");

program.addCommand(publishCommand);
program.addCommand(statusCommand);

program.parse();
