import { execFileSync } from "node:child_process";

export function makeGh({ owner, repo, token }) {
  const env = { ...process.env, GH_TOKEN: token };
  const run = (args, options = {}) =>
    String(
      execFileSync("gh", [...args, "--repo", `${owner}/${repo}`], {
        env,
        encoding: "utf8",
        ...options,
      }),
    ).trim();
  const gh = (...args) => {
    const options = typeof args.at(-1) === "object" ? args.pop() : {};
    return run(args, options);
  };
  const ghApi = (...args) => run(["api", ...args]);
  return { gh, ghApi };
}
