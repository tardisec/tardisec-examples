// Regenerates every committed `.tardisec.*` file and fails on any byte difference, which is
// what the root README promises: "They are byte-for-byte what the API serves".
//
// The generator is `assembleConfigFiles` in the tardisec monorepo (utils/config-files.js), the
// same function handlers/api-recommendation serves from, so this repo checks out the monorepo
// rather than reimplementing anything. Usage:
//
//   MONOREPO=../monorepo node .github/check-drift.mjs
//
// The fixture below is the README's stated input: example.com, strict remediation mode, a few
// confirmed allow-rules. Change it only when the README's description of these files changes.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const monorepo = resolve(process.env.MONOREPO ?? "../monorepo");
const { assembleConfigFiles } = await import(
	pathToFileURL(`${monorepo}/utils/config-files.js`)
);

// Confirmed csp-violation allow-candidates. isEnforced graduates a candidate into the enforce
// policy, which is what gives the checked-in CSP real sources instead of a bare default-src.
const allow = (subtype) => ({
	type: "csp-violation",
	subtype,
	value: "self",
	isEnforced: true,
	isReported: true,
});

const generated = assembleConfigFiles({
	domain: "example.com",
	config: { remediationMode: "strict" },
	rules: [
		"connect-src",
		"font-src",
		"form-action",
		"img-src",
		"manifest-src",
		"script-src-elem",
		"style-src-elem",
	].map(allow),
});

// Tracked files only, so an untracked scratch file or a gitignored .terraform/ cannot fail this.
const committed = execFileSync("git", ["ls-files", "-z"], { encoding: "buffer" })
	.toString("utf8")
	.split("\0")
	.filter((path) => basename(path).startsWith(".tardisec."));

// Where a file sits is the integration's business (the sync action's `path` input), so match on
// the served filename and let each directory place it wherever its framework wants.
const problems = [];
for (const path of committed) {
	const want = generated[basename(path)];
	if (want === undefined) {
		problems.push(`${path}: no such file is served; the API cannot produce this name`);
		continue;
	}
	const got = readFileSync(path, "utf8");
	if (want === got) continue;
	const wantLines = want.split("\n");
	const gotLines = got.split("\n");
	const i = gotLines.findIndex((line, n) => line !== wantLines[n]);
	problems.push(
		`${path}: drifted from the generator at line ${i + 1}\n` +
			`    committed: ${JSON.stringify(gotLines[i]?.slice(0, 200))}\n` +
			`    served:    ${JSON.stringify(wantLines[i]?.slice(0, 200))}`,
	);
}

if (problems.length) {
	console.error(problems.join("\n"));
	console.error(
		`\n${problems.length} of ${committed.length} checked-in files disagree with the generator. ` +
			"Re-sync the directory rather than editing the file by hand.",
	);
	process.exit(1);
}
console.log(`${committed.length} checked-in .tardisec.* files match the generator`);
