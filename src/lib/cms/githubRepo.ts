import { execSync } from "node:child_process";
import { PUBLIC_GITHUB_BRANCH, PUBLIC_GITHUB_REPO } from "astro:env/server";
import cmsSite from "../../data/cms.json";

const PLACEHOLDER_REPO = "OWNER/REPO";

export type CmsSiteFile = {
  githubRepo?: string;
  branch?: string;
};

function parseGithubRepoFromRemote(remoteUrl: string): string | undefined {
  const cleaned = remoteUrl.replace(/\.git$/i, "").trim();
  const ssh = cleaned.match(/^git@github\.com:(.+)$/i);
  if (ssh?.[1]) return ssh[1];

  try {
    const parsed = new URL(cleaned);
    if (!/github\.com$/i.test(parsed.hostname)) return undefined;
    const parts = parsed.pathname.replace(/^\//, "").split("/").filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    const loose = cleaned.match(/github\.com[/:]([^/]+\/[^/]+)/i);
    if (loose?.[1]) return loose[1].replace(/\.git$/i, "");
  }

  return undefined;
}

function detectGithubRepoFromGit(): string | undefined {
  try {
    const raw = execSync("git remote get-url origin", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return parseGithubRepoFromRemote(raw);
  } catch {
    return undefined;
  }
}

/** Dépôt GitHub `owner/repo` utilisé par Decap (env > cms.json > remote origin). */
export function resolveGithubRepo(): string {
  const fromEnv = PUBLIC_GITHUB_REPO?.trim();
  if (fromEnv) return fromEnv.replace(/\.git$/i, "");

  const fromFile = (cmsSite as CmsSiteFile).githubRepo?.trim();
  if (fromFile) return fromFile.replace(/\.git$/i, "");

  return detectGithubRepoFromGit() ?? PLACEHOLDER_REPO;
}

export function resolveGithubBranch(): string {
  const fromEnv = PUBLIC_GITHUB_BRANCH?.trim();
  if (fromEnv) return fromEnv;

  const fromFile = (cmsSite as CmsSiteFile).branch?.trim();
  if (fromFile) return fromFile;

  return "main";
}

export function isGithubRepoConfigured(repo: string): boolean {
  return repo.length > 0 && repo !== PLACEHOLDER_REPO && repo.includes("/");
}
