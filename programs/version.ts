import { join } from 'node:path';

type BumpType = 'patch' | 'minor' | 'major';

interface Manifest {
	header: { name: string; version: number[] };
	modules?: Array<{ version?: number[] }>;
};

const PROJECT_ROOT = join(__dirname, '../');
const packageJsonFile = Bun.file(join(PROJECT_ROOT, 'package.json'));
const manifestJsonFile = Bun.file(join(PROJECT_ROOT, 'manifest.json'));
const contantsFile = Bun.file(join(PROJECT_ROOT, 'scripts', 'util', 'constants.js'));

function parseSemver(version: string): [number, number, number] {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
	if (!match) throw new Error(`Invalid semver: ${version}`);
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function bumpVersion(version: string, bumpType: BumpType): string {
	const [major, minor, patch] = parseSemver(version);

	if (bumpType === 'major') return `${major + 1}.0.0`;
	if (bumpType === 'minor') return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

function toVersionArray(version: string): [number, number, number] {
	return parseSemver(version);
}

const bumpType = Bun.argv[2] as BumpType | undefined;

if (!bumpType || !['patch', 'minor', 'major'].includes(bumpType)) {
	console.error('Usage: bun run version <patch|minor|major>');
	process.exit(1);
}

const packageJson: { version: string } = await packageJsonFile.json();

const currentVersion = packageJson.version;
const nextVersion = bumpVersion(currentVersion, bumpType);
const nextVersionArray = toVersionArray(nextVersion);

packageJson.version = nextVersion;
packageJsonFile.write(JSON.stringify(packageJson, null, 2) + '\n');

const manifest: Manifest = await manifestJsonFile.json();

manifest.header.version = nextVersionArray;
manifest.header.name = manifest.header.name.replace(
	/v\d+\.\d+\.\d+/,
	`v${nextVersion}`
);

if (Array.isArray(manifest.modules)) {
	for (const moduleEntry of manifest.modules) {
		if (moduleEntry.version) moduleEntry.version = nextVersionArray;
	}
}

manifestJsonFile.write(JSON.stringify(manifest, null, 2) + '\n');

const constantsText = await contantsFile.text();
const updatedConstantsText = constantsText.replace(
	/export const VERSION = '.*';/,
	`export const VERSION = '${nextVersion}';`
);

if (updatedConstantsText === constantsText) {
	throw new Error('Failed to update VERSION constant in scripts/util/constants.js');
}

await contantsFile.write(updatedConstantsText);

console.log(`Version bumped: ${currentVersion} -> ${nextVersion}`);
