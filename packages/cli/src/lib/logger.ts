import chalk from "chalk";
import ora from "ora";

/** Log an informational message (cyan) */
export function info(msg: string): void {
  console.log(chalk.cyan("ℹ"), msg);
}

/** Log a success message (green) */
export function success(msg: string): void {
  console.log(chalk.green("✔"), msg);
}

/** Log a warning message (yellow) */
export function warn(msg: string): void {
  console.warn(chalk.yellow("⚠"), msg);
}

/** Log an error message (red) */
export function error(msg: string): void {
  console.error(chalk.red("✖"), msg);
}

/** Create an ora spinner with the given message */
export function createSpinner(msg: string) {
  return ora(msg);
}
