import { execFileSync } from "node:child_process";

try {
  execFileSync("npm", ["ls", "--depth=0", "--silent"], { stdio: "ignore" });
} catch {
  console.error(
    "Dependencies have changed since the last install. Run `npm ci`, then build again.",
  );
  process.exit(1);
}
