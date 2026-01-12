const fs = require('fs');
const path = require('path');
const { parseModules } = require('../scripts/lib/progress');

const projectFilePath = path.join(__dirname, '..', 'PROYECTO.md');
const outputFilePath = path.join(__dirname, 'data', 'project_data.json');

try {
  const modules = parseModules(projectFilePath);

  const phasesMap = modules.reduce((acc, mod) => {
    if (!acc[mod.phase]) {
      acc[mod.phase] = {
        name: mod.phase,
        order: mod.phaseOrder || 0,
        modules: [],
      };
    }

    acc[mod.phase].modules.push({
      id: mod.id,
      name: mod.name,
      owner: mod.owner,
      status: mod.status,
      progress: mod.progress,
      summary: mod.summary,
      needs: mod.needs,
    });

    return acc;
  }, {});

  const phases = Object.values(phasesMap)
    .sort((a, b) => a.order - b.order)
    .map((phase) => {
      const total = phase.modules.length || 1;
      const progress =
        phase.modules.reduce((sum, m) => sum + (m.progress || 0), 0) / total;

      const statusCounts = phase.modules.reduce((acc, module) => {
        acc[module.status] = (acc[module.status] || 0) + 1;
        return acc;
      }, {});

      return {
        name: phase.name,
        order: phase.order,
        progress,
        modules: phase.modules,
        statusCounts,
      };
    });

  const overallProgress =
    modules.reduce((sum, mod) => sum + (mod.progress || 0), 0) /
    (modules.length || 1);

  const needsAction = modules
    .filter((m) => !!m.needs && m.needs.trim() !== '' && m.needs.trim() !== '---')
    .map((m) => ({
      module: m.name,
      phase: m.phase,
      detail: m.needs,
    }));

  const projectData = {
    projectName: 'RD-AMI Progress',
    lastUpdated: new Date().toISOString(),
    overallProgress,
    phases,
    needsAction,
  };

  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  fs.writeFileSync(outputFilePath, JSON.stringify(projectData, null, 2));

  console.log('Project data parsed correctly from the module table and saved to project_data.json');
} catch (error) {
  console.error('Error parsing project file:', error);
  process.exit(1);
}
