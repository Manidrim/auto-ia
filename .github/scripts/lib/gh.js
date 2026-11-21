import { execSync } from "node:child_process";

export function makeGh({ owner, repo, token }) {
  const env = { ...process.env, GH_TOKEN: token };
  const gh = (args) =>
    execSync(`gh ${args} --repo ${owner}/${repo}`, {
      env,
      encoding: "utf8",
    }).trim();
  const ghApi = (endpoint) =>
    execSync(`gh api ${endpoint}`, { env, encoding: "utf8" }).trim();
  return { gh, ghApi };
}
