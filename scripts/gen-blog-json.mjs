// gen-blog-json.mjs — emit dist/blog.json for the maw blog federation / blog-health.
//
// Runs as part of `npm run build` (astro build && node scripts/gen-blog-json.mjs), so any
// environment that builds this site — the box checkout or the consultant's fresh clone —
// produces the feed with zero extra steps. Astro can't do this as a .json.js endpoint without
// duplicating per-post metadata: titles live in each post's <Base title="..."> markup and dates
// only exist in git history, so a post-build script that reads both is the honest source.
//
// Feed shape follows what `maw blog health` checks: count + posts[] whose url must return the
// post itself (health curls every slug — see the SPA false-200 lesson: a feed whose urls all
// "200" against a catch-all page is a lie, so urls here point at real static pages).
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const blogDir = join(root, "src/pages/blog");
const SITE = "https://jizo.buildwithoracle.com";

function firstCommitDate(relPath) {
  try {
    const out = execFileSync(
      "git", ["log", "--follow", "--format=%as", "--reverse", "--", relPath],
      { cwd: root, encoding: "utf8" },
    ).trim();
    return out.split("\n")[0] || null;
  } catch {
    return null; // no git in this environment — date is optional, the feed must still build
  }
}

const posts = [];
for (const file of readdirSync(blogDir).sort()) {
  if (!file.endsWith(".astro") || file === "index.astro") continue;
  const slug = file.replace(/\.astro$/, "");
  const src = readFileSync(join(blogDir, file), "utf8");
  const title = src.match(/<Base title="([^"]*)"/)?.[1] ?? slug;
  const desc = src.match(/desc="([^"]*)"/)?.[1] ?? "";
  posts.push({
    slug,
    title,
    desc,
    date: firstCommitDate(`src/pages/blog/${file}`),
    url: `${SITE}/blog/${slug}/`,
  });
}

// Newest first, undated last — readers of the feed expect reverse-chronological.
posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

const dist = join(root, "dist");
if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
const feed = { site: SITE, oracle: "jizo", count: posts.length, posts };
writeFileSync(join(dist, "blog.json"), JSON.stringify(feed, null, 2) + "\n");
console.log(`blog.json: ${posts.length} posts → dist/blog.json`);
