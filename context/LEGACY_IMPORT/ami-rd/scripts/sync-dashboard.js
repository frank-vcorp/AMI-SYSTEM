#!/usr/bin/env node
/**
 * Sincroniza las fuentes del tablero:
 * 1) Lee la tabla de módulos en PROYECTO.md
 * 2) Genera el dataset del sitio simple (`status-site/data/status.json`)
 *
 * Uso:
 *   node scripts/sync-dashboard.js
 *   node scripts/sync-dashboard.js --skip-site        # no escribe el dataset del sitio
 *   node scripts/sync-dashboard.js --dry-run          # no escribe nada, solo loguea
 */

const fs = require("fs");
const path = require("path");
const { parseModules } = require("./lib/progress");

const ROOT = path.join(__dirname, "..");
const PROJECT_FILE = path.join(ROOT, "PROYECTO.md");
const STATUS_DATA_FILE = path.join(
  ROOT,
  "status-site",
  "data",
  "status.json"
);

const args = process.argv.slice(2);
const options = {
  skipSite: args.includes("--skip-site"),
  dryRun: args.includes("--dry-run"),
  verbose: args.includes("--verbose"),
};

async function main() {
  const modules = parseModules(PROJECT_FILE);
  log("info", `Se detectaron ${modules.length} módulos en PROYECTO.md.`);

  handleStatusDataset(modules);
}

function handleStatusDataset(modules) {
  if (options.skipSite) {
    log("info", "Dataset del status-site omitido (--skip-site).");
    return;
  }

  const payload = buildStatusPayload(modules);

  if (options.dryRun) {
    log(
      "info",
      `[dry-run] Status-site data ${STATUS_DATA_FILE} se mantendría actualizado.`
    );
    return;
  }

  writeJson(payload, STATUS_DATA_FILE, "Status-site data");
}

function writeJson(data, outputPath, label) {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(outputPath, `${json}\n`, "utf8");
  log("info", `${label} actualizado: ${outputPath}`);
}

function buildStatusPayload(modules) {
  const generatedAt = new Date().toISOString();
  const totalModules = modules.length;
  const overallProgress = Math.round(
    modules.reduce((sum, m) => sum + (m.progress || 0), 0) /
      (totalModules || 1)
  );

  const phasesMap = {};
  modules.forEach((module) => {
    if (!phasesMap[module.phase]) {
      phasesMap[module.phase] = {
        phase: module.phase,
        order: module.phaseOrder || 0,
        modules: [],
      };
    }
    phasesMap[module.phase].modules.push(module);
  });

  const phases = Object.values(phasesMap)
    .sort((a, b) => a.order - b.order)
    .map((phase) => {
      const count = phase.modules.length || 1;
      const progress = Math.round(
        phase.modules.reduce((sum, m) => sum + (m.progress || 0), 0) / count
      );
      const statusCounts = phase.modules.reduce(
        (acc, module) => {
          acc[module.status] = (acc[module.status] || 0) + 1;
          return acc;
        },
        {}
      );
      return {
        phase: phase.phase,
        order: phase.order,
        progress,
        totalModules: phase.modules.length,
        statusCounts,
        modules: phase.modules,
      };
    });

  return {
    generatedAt,
    totalModules,
    overallProgress,
    phases,
  };
}

function log(level, message) {
  if (level === "info" && !options.verbose) {
    console.log(message);
  } else if (level === "warn") {
    console.warn(message);
  } else if (options.verbose) {
    console.log(`[${level}] ${message}`);
  } else if (level !== "info") {
    console.log(message);
  }
}

main().catch((error) => {
  console.error("Error sincronizando fuentes del dashboard:", error);
  process.exit(1);
});
