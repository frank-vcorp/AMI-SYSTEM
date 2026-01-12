document.addEventListener("DOMContentLoaded", () => {
  const lastUpdatedEl = document.getElementById("last-updated");
  const overallProgressBar = document.getElementById("overall-progress-bar");
  const phasesContainer = document.getElementById("phases-container");
  const actionItemsEl = document.getElementById("action-items");
  const statusBannerEl = document.getElementById("status-text");

  fetch("data/project_data.json")
    .then((response) => response.json())
    .then((data) => {
      renderOverall(data, lastUpdatedEl, overallProgressBar);
      renderStatusBanner(data.phases || [], statusBannerEl);
      renderPhases(data.phases || [], phasesContainer);
      renderActions(data.needsAction || [], actionItemsEl);
    })
    .catch((error) => {
      console.error("Error al cargar los datos del proyecto:", error);
      phasesContainer.innerHTML =
        '<p class="text-red-500">Error al cargar los datos del dashboard.</p>';
    });
});

function renderOverall(data, lastUpdatedEl, overallProgressBar) {
  if (lastUpdatedEl && data.lastUpdated) {
    lastUpdatedEl.textContent = new Date(data.lastUpdated).toLocaleString("es-MX");
  }
  const overall = Math.round(data.overallProgress || 0);
  if (overallProgressBar) {
    overallProgressBar.style.width = `${overall}%`;
    overallProgressBar.textContent = `${overall}%`;
  }
}

function renderStatusBanner(phases, bannerEl) {
  if (!bannerEl) return;
  const activePhase =
    phases.find((phase) =>
      (phase.modules || []).some((module) => module.status !== "done")
    ) || phases[phases.length - 1];

  if (!activePhase) {
    bannerEl.textContent = "Sin datos del piloto aún.";
    return;
  }

  const pendingCount = (activePhase.modules || []).filter(
    (module) => module.status === "pending"
  ).length;
  const message =
    pendingCount === 0
      ? `${activePhase.name}: entregable listo y en validación.`
      : `${activePhase.name}: ${pendingCount} módulo(s) en preparación.`;
  bannerEl.textContent = message;
}

function renderPhases(phases, container) {
  if (!container) return;
  container.innerHTML = "";

  phases.forEach((phase) => {
    const phaseProgress = Math.round(phase.progress || 0);
    const card = document.createElement("div");
    card.className = "bg-white p-6 rounded-lg shadow-md space-y-4";

    const modulesHtml = (phase.modules || [])
      .map((module) => renderModule(module))
      .join("");

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-800">${phase.name}</h3>
          <span class="text-sm text-gray-500">Módulos: ${phase.modules.length}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-6 mt-4">
          <div class="bg-blue-600 h-6 text-xs font-semibold text-white text-center leading-none rounded-full" style="width:${phaseProgress}%">${phaseProgress}%</div>
        </div>
      </div>
      <ul class="divide-y divide-gray-200">
        ${modulesHtml}
      </ul>
    `;

    container.appendChild(card);
  });
}

function renderModule(module) {
  const progress = Math.round(module.progress || 0);
  return `
    <li class="py-3 border-b border-gray-100 last:border-b-0">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-800">${module.name}</p>
          <p class="text-xs text-gray-500">${module.summary || "Sin descripción"}</p>
        </div>
        <div class="flex items-center gap-3">
          ${renderStatusBadge(module.status)}
          <span class="text-sm font-semibold text-gray-700">${progress}%</span>
        </div>
      </div>
      <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div class="h-2 rounded-full ${statusColor(module.status)}" style="width:${progress}%"></div>
      </div>
      <p class="mt-2 text-xs text-gray-500">
        <span class="font-semibold text-gray-700">Responsable:</span> ${module.owner}
      </p>
    </li>
  `;
}

function renderActions(actions, container) {
  if (!container) return;
  container.innerHTML = "";

  if (!actions.length) {
    container.innerHTML = "<li>No hay puntos de acción pendientes.</li>";
    return;
  }

  actions.slice(0, 5).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.module}</strong> (${item.phase}): ${item.detail}`;
    container.appendChild(li);
  });
}

function renderStatusBadge(status = "") {
  const map = {
    progress: {
      label: "En progreso",
      classes: "bg-blue-100 text-blue-600",
    },
    pending: {
      label: "Pendiente",
      classes: "bg-gray-100 text-gray-600",
    },
    blocked: {
      label: "Bloqueado",
      classes: "bg-amber-100 text-amber-600",
    },
    done: {
      label: "Completado",
      classes: "bg-green-100 text-green-600",
    },
  };
  const badge = map[status] || map.pending;
  return `<span class="px-3 py-1 rounded-full text-xs font-semibold ${badge.classes}">${badge.label}</span>`;
}

function statusColor(status = "") {
  switch (status) {
    case "done":
      return "bg-green-500";
    case "progress":
      return "bg-blue-500";
    case "blocked":
      return "bg-amber-500";
    default:
      return "bg-gray-400";
  }
}
