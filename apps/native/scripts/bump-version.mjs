#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const APP_JSON = resolve(ROOT, "app.json");
const PACKAGE_JSON = resolve(ROOT, "package.json");

const VALID_TYPES = new Set(["patch", "minor", "major"]);

function parseVersion(v) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(v ?? "");
  if (!match) {
    throw new Error(
      `Versão inválida: "${v}". Use o formato semver MAJOR.MINOR.PATCH (ex: 1.0.0).`
    );
  }
  return match.slice(1).map((n) => parseInt(n, 10));
}

function bump(version, type) {
  const [major, minor, patch] = parseVersion(version);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Tipo inválido: ${type}`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function main() {
  const type = process.argv[2];
  const explicit = process.argv[3];

  if (!type || (!VALID_TYPES.has(type) && type !== "set")) {
    console.error(
      "Uso:\n" +
        "  node scripts/bump-version.mjs <patch|minor|major>\n" +
        "  node scripts/bump-version.mjs set <X.Y.Z>"
    );
    process.exit(1);
  }

  const appJson = readJson(APP_JSON);
  const pkgJson = readJson(PACKAGE_JSON);

  const current = appJson.expo?.version ?? pkgJson.version ?? "1.0.0";

  let next;
  if (type === "set") {
    if (!explicit) {
      console.error("Erro: informe a versão. Ex: set 1.2.3");
      process.exit(1);
    }
    parseVersion(explicit);
    next = explicit;
  } else {
    next = bump(current, type);
  }

  if (!appJson.expo) appJson.expo = {};
  appJson.expo.version = next;
  pkgJson.version = next;

  writeJson(APP_JSON, appJson);
  writeJson(PACKAGE_JSON, pkgJson);

  console.log(`✓ Versão atualizada: ${current} → ${next}`);
  console.log("  - app.json (expo.version)");
  console.log("  - package.json (version)");
  console.log("");
  console.log(
    "  buildNumber/versionCode são auto-incrementados pelo EAS no build."
  );
}

main();
