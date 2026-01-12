const fs = require("fs");

const PROGRESS_MARKERS = {
  start: "<!-- progress-modules:start -->",
  end: "<!-- progress-modules:end -->",
};

function parseModules(
  projectPath,
  markers = PROGRESS_MARKERS
) {
  const content = fs.readFileSync(projectPath, "utf8");
  const start = content.indexOf(markers.start);
  const end = content.indexOf(markers.end);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "No se encontró la tabla de módulos entre los marcadores esperados."
    );
  }

  const tableBlock = content.slice(
    start + markers.start.length,
    end
  );
  const lines = tableBlock
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));

  if (lines.length < 3) {
    throw new Error("La tabla de módulos no contiene filas de datos.");
  }

  const dataLines = lines.slice(2);
  const modules = dataLines
    .map((line) => {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (cells.length < 9) {
        return null;
      }
      const [
        id,
        name,
        phase,
        phaseOrder,
        owner,
        status,
        progress,
        summary,
        needs,
      ] = cells;
      return {
        id,
        name,
        phase,
        phaseOrder: Number(phaseOrder) || 0,
        owner,
        status,
        progress: Number(progress) || 0,
        summary,
        needs,
      };
    })
    .filter(Boolean);

  if (!modules.length) {
    throw new Error("No se pudieron parsear módulos desde PROYECTO.md");
  }

  return modules;
}

module.exports = {
  parseModules,
  PROGRESS_MARKERS,
};
