const overviewEl = document.getElementById("overviewCards");
const phasesEl = document.getElementById("phasesList");
const modulesEl = document.getElementById("modulesList");
const generatedAtEl = document.getElementById("generatedAt");

init();

async function init() {
  try {
    const response = await fetch(`data/status.json?ts=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar status.json (HTTP ${response.status})`);
    }
    const data = await response.json();
    renderGeneratedAt(data.generatedAt);
    renderOverview(data);
    renderPhases(data.phases || []);
    renderModules(data.phases || []);
  } catch (error) {
    console.error(error);
    const message =
      "No pudimos cargar el avance. Verifica que el pipeline haya generado el archivo status.json.";
    if (overviewEl) {
      overviewEl.innerHTML = `<div class="card text-sm text-rose-300">${message}</div>`;
    }
    if (phasesEl) {
      phasesEl.innerHTML = "";
    }
    if (modulesEl) {
      modulesEl.innerHTML = "";
    }
  }
}

function renderGeneratedAt(timestamp) {
  if (!generatedAtEl) return;
  const date = timestamp ? new Date(timestamp) : null;
  generatedAtEl.textContent = date
    ? date.toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Dato no disponible";
}

function renderOverview(data) {
  if (!overviewEl) return;
  const counts = aggregateStatuses(data.phases || []);
  const cards = [
    {
      label: "Avance global",
      value: `${data.overallProgress ?? 0}%`,
      hint: "Promedio de todos los módulos",
    },
    {
      label: "Módulos en progreso",
      value: counts.progress,
      hint: "Trabajándose ahora",
    },
    {
      label: "Pendientes próximos",
      value: counts.pending,
      hint: "Listos para arrancar",
    },
    {
      label: "Bloqueos",
      value: counts.blocked,
      hint: "Seguimiento necesario",
    },
  ];

  overviewEl.innerHTML = cards
    .map(
      (card) => `
      <div class="card space-y-1">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-400">${card.label}</p>
        <p class="text-3xl font-semibold text-white">${card.value}</p>
        <p class="text-sm text-slate-400">${card.hint}</p>
      </div>
    `
    )
    .join("");
}

function renderPhases(phases) {
  if (!phasesEl) return;
  if (!phases.length) {
    phasesEl.innerHTML =
      '<div class="card text-sm text-slate-300">Sin datos de fases todavía.</div>';
    return;
  }

  phasesEl.innerHTML = phases
    .map((phase) => {
      const bar = `
        <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-ami-500 to-ami-700" style="width:${phase.progress}%;"></div>
        </div>
      `;
      const statuses = Object.entries(phase.statusCounts || {})
        .map(
          ([status, value]) =>
            `<span class="status-chip">${labelStatus(status)} ${value}</span>`
        )
        .join(" ");
      return `
        <article class="card space-y-3">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400">${phase.phase}</p>
              <p class="text-2xl font-semibold mt-1">${phase.progress}%</p>
            </div>
            <div class="text-right text-sm text-slate-400">
              <p>${phase.totalModules} módulos</p>
            </div>
          </div>
          ${bar}
          <div class="flex flex-wrap gap-2">
            ${statuses || '<span class="text-sm text-slate-400">Sin estatus</span>'}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderModules(phases) {
  if (!modulesEl) return;
  const modules = phases
    .flatMap((phase) =>
      (phase.modules || []).map((module) => ({
        ...module,
        phase: phase.phase,
        order: phase.order,
      }))
    )
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.progress === b.progress ? a.name.localeCompare(b.name) : b.progress - a.progress;
    });

  if (!modules.length) {
    modulesEl.innerHTML =
      '<div class="card text-sm text-slate-300">Aún no hay módulos registrados.</div>';
    return;
  }

  modulesEl.innerHTML = modules
    .map((module) => {
      const statusInfo = statusStyles(module.status);
      return `
        <article class="card space-y-3 border-l-4 ${statusInfo.border}">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${module.phase}</p>
              <h3 class="text-lg font-semibold">${module.name}</h3>
            </div>
            <span class="status-chip ${statusInfo.chip}">${statusInfo.label}</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div class="h-full ${statusInfo.bar}" style="width:${module.progress}%"></div>
              </div>
            </div>
            <span class="text-sm text-slate-300">${module.progress}%</span>
          </div>
          <p class="text-sm text-slate-300">${module.summary}</p>
          <div class="text-xs text-slate-400">
            <p><span class="font-semibold text-slate-200">Necesita:</span> ${module.needs}</p>
            <p><span class="font-semibold text-slate-200">Responsable:</span> ${module.owner}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function aggregateStatuses(phases) {
  const counts = { pending: 0, progress: 0, blocked: 0, done: 0 };
  phases.forEach((phase) => {
    Object.entries(phase.statusCounts || {}).forEach(([status, value]) => {
      if (counts[status] !== undefined) {
        counts[status] += value;
      }
    });
  });
  return counts;
}

function statusStyles(status) {
  switch (status) {
    case "progress":
      return {
        label: "En progreso",
        chip: "text-cyan-300 bg-cyan-500/10",
        bar: "bg-gradient-to-r from-cyan-400 to-cyan-600",
        border: "border-cyan-500/60",
      };
    case "done":
      return {
        label: "Completado",
        chip: "text-emerald-300 bg-emerald-500/10",
        bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
        border: "border-emerald-500/60",
      };
    case "blocked":
      return {
        label: "Bloqueado",
        chip: "text-rose-300 bg-rose-500/10",
        bar: "bg-gradient-to-r from-rose-400 to-rose-600",
        border: "border-rose-500/60",
      };
    default:
      return {
        label: "Pendiente",
        chip: "text-amber-300 bg-amber-500/10",
        bar: "bg-gradient-to-r from-amber-400 to-amber-600",
        border: "border-amber-500/60",
      };
  }
}

function labelStatus(status) {
  return {
    progress: "Progreso",
    pending: "Pendiente",
    blocked: "Bloqueado",
    done: "Completado",
  }[status] || status;
}
