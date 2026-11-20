// Runs before every build: stops with one clear line when node_modules does not match
// package-lock.json (for example after a pull that added dependencies), instead of a wall of
// type errors.
import { execFileSync } from "node:child_process";

try {
  execFileSync("npm", ["ls", "--depth=0", "--silent"], { stdio: "ignore" });
} catch {
  console.error(
    "Dependencies have changed since the last install. Run `npm ci`, then build again.",
  );
  process.exit(1);
}
