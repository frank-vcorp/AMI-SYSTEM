#!/usr/bin/env node

/**
 * Dashboard Generator for Metodología INTEGRA
 * 
 * Reads PROYECTO.md and generates a visual dashboard (README-DASHBOARD.md)
 * with project statistics, task distribution, and progress visualization.
 * 
 * Usage:
 *   npm run dashboard:update
 *   node scripts/generate-dashboard.js
 * 
 * Output:
 *   README-DASHBOARD.md (in project root)
 *   progressdashboard/data/project_data.json (for web dashboard)
 */

const fs = require('fs');
const path = require('path');
const { parseModules } = require('./lib/progress');

// Configuration
const CONFIG = {
  projectFile: 'PROYECTO.md',
  outputFile: 'README-DASHBOARD.md',
  dataFile: 'progressdashboard/data/project_data.json',
  checkpointsDir: 'Checkpoints',
};

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Parse PROYECTO.md
function parseProyectoLocal(content) {
  const tasks = [];
  const lines = content.split('\n');
  
  let currentTask = null;
  let inTaskBlock = false;
  
  // Fallback: try to parse module table instead
  if (!lines.some(l => l.match(/^###\s+\[/))) {
    try {
      const modules = parseModules(CONFIG.projectFile);
      return modules.map(m => ({
        id: m.id,
        name: m.name,
        priority: '🟡',
        estimation: 0,
        assigned: m.owner,
        sprint: m.phase,
        tags: [],
        dependencies: [],
        blockers: [],
        status: m.status === 'done' ? 'completed' : m.status === 'in_progress' ? 'in-progress' : 'pending'
      }));
    } catch (e) {
      console.warn('Warning: Could not parse modules from PROYECTO.md');
      return [];
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect task header: ### [ID] Nombre
    const taskMatch = line.match(/^###\s+\[([^\]]+)\]\s+(.+)$/);
    if (taskMatch) {
      if (currentTask) tasks.push(currentTask);
      
      currentTask = {
        id: taskMatch[1],
        name: taskMatch[2],
        priority: null,
        estimation: null,
        assigned: null,
        sprint: null,
        tags: [],
        dependencies: [],
        blockers: [],
        status: 'pending'
      };
      inTaskBlock = true;
      continue;
    }
    
    if (!inTaskBlock || !currentTask) continue;
    
    // Stop at next task or major section
    if (line.startsWith('##') && !line.startsWith('###')) {
      inTaskBlock = false;
      if (currentTask) tasks.push(currentTask);
      currentTask = null;
      continue;
    }
    
    // Parse metadata
    const priorityMatch = line.match(/Prioridad:\*\*\s+(🔴|🟡|🟢)/);
    if (priorityMatch) currentTask.priority = priorityMatch[1];
    
    const estimationMatch = line.match(/Estimación:\*\*\s+(\d+)h?\s*(\d+)?m?/);
    if (estimationMatch) {
      const hours = parseInt(estimationMatch[1]) || 0;
      const minutes = parseInt(estimationMatch[2]) || 0;
      currentTask.estimation = hours + minutes / 60;
    }
    
    const assignedMatch = line.match(/Asignado:\*\*\s+([A-Za-zÀ-ÿ0-9 _]+|Sin asignar)/);
    if (assignedMatch) currentTask.assigned = assignedMatch[1];
    
    const sprintMatch = line.match(/Sprint:\*\*\s+(.+)/);
    if (sprintMatch) currentTask.sprint = sprintMatch[1].trim();
    
    const tagsMatch = line.match(/Tags:\*\*\s+(.+)/);
    if (tagsMatch) {
      currentTask.tags = tagsMatch[1].match(/`#[^`]+`/g)?.map(t => t.replace(/`/g, '')) || [];
    }
    
    // Detect completion status
    if (line.includes('✅') || line.includes('[x]') || line.match(/Estado:\*\*\s+✅/)) {
      currentTask.status = 'completed';
    } else if (line.includes('🚧') || line.match(/Estado:\*\*\s+🚧/)) {
      currentTask.status = 'in-progress';
    }
  }
  
  if (currentTask) tasks.push(currentTask);
  
  return tasks;
}

// Generate dashboard markdown from modules
function generateDashboardFromModules(modules) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];
  
  let md = `# 📊 AMI-SYSTEM Progress Dashboard\n\n`;
  md += `> **Última actualización:** ${dateStr} ${timeStr}\n\n`;
  
  // Overall progress
  const totalModules = modules.length;
  const completedModules = modules.filter(m => m.progress === 100).length;
  const inProgressModules = modules.filter(m => m.status === 'in_progress').length;
  const overallProgress = modules.reduce((sum, m) => sum + m.progress, 0) / totalModules;
  
  md += `## 📈 Resumen General\n\n`;
  md += `| Métrica | Valor | Visualización |\n`;
  md += `|---------|-------|---------------|\n`;
  md += `| **Módulos totales** | ${totalModules} | — |\n`;
  md += `| **Completados** | ${completedModules} | ✅ ${((completedModules / totalModules) * 100).toFixed(1)}% |\n`;
  md += `| **En progreso** | ${inProgressModules} | 🔄 ${((inProgressModules / totalModules) * 100).toFixed(1)}% |\n`;
  md += `| **Progreso general** | ${overallProgress.toFixed(1)}% | ${progressBar(overallProgress)} |\n\n`;
  
  // Progress by phase
  md += `## 🎯 Progreso por Fase\n\n`;
  
  const phases = {};
  modules.forEach(mod => {
    if (!phases[mod.phase]) {
      phases[mod.phase] = { modules: [], order: mod.phaseOrder };
    }
    phases[mod.phase].modules.push(mod);
  });
  
  Object.entries(phases)
    .sort((a, b) => a[1].order - b[1].order)
    .forEach(([phaseName, phaseData]) => {
      const phaseModules = phaseData.modules;
      const phaseProgress = phaseModules.reduce((sum, m) => sum + m.progress, 0) / phaseModules.length;
      
      md += `### ${phaseName}\n`;
      md += `**Progreso:** ${progressBar(phaseProgress)} ${phaseProgress.toFixed(1)}%\n\n`;
      
      md += `| Módulo | Owner | Estado | Progreso | Descripción |\n`;
      md += `|--------|-------|--------|----------|-------------|\n`;
      
      phaseModules.forEach(mod => {
        const statusEmoji = mod.status === 'done' ? '✅' : mod.status === 'in_progress' ? '🔄' : '⏳';
        const modProgress = `${progressBar(mod.progress, 5)} ${mod.progress}%`;
        const summary = mod.summary ? mod.summary.substring(0, 50) + '...' : '—';
        md += `| ${mod.name} | ${mod.owner} | ${statusEmoji} | ${modProgress} | ${summary} |\n`;
      });
      
      md += `\n`;
    });
  
  // Blockers and needs
  md += `## 🚨 Bloqueos y Necesidades\n\n`;
  const needsAction = modules.filter(m => m.needs && m.needs.trim() !== '-' && m.needs.trim() !== '---' && m.needs.trim() !== '');
  
  if (needsAction.length > 0) {
    needsAction.forEach(mod => {
      md += `- **${mod.name}**: ${mod.needs}\n`;
    });
  } else {
    md += `✅ Sin bloqueos identificados en este momento.\n`;
  }
  
  md += `\n`;
  
  // Footer
  md += `---\n\n`;
  md += `## 📝 Notas\n\n`;
  md += `- Este dashboard se genera automáticamente desde \`PROYECTO.md\`\n`;
  md += `- Para regenerarlo: \`npm run dashboard:update\`\n`;
  md += `- Para editar módulos, actualiza la tabla entre \`<!-- progress-modules:start -->\` y \`<!-- progress-modules:end -->\` en \`PROYECTO.md\`\n`;
  md += `- Último generado: ${now.toISOString()}\n`;
  
  return md;
}

// Generate progress bar
function progressBar(percentage, length = 20) {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

// Main execution
function main() {
  try {
    log('🚀 Generando dashboard...', 'cyan');
    
    // Read PROYECTO.md
    log('📖 Leyendo PROYECTO.md...', 'blue');
    const projectPath = CONFIG.projectFile;
    
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Archivo no encontrado: ${projectPath}`);
    }
    
    // Parse modules
    log('🔍 Parseando módulos...', 'blue');
    const modules = parseModules(projectPath);
    log(`   ✅ ${modules.length} módulos encontrados`, 'green');
    
    // Generate dashboard markdown
    log('✨ Creando dashboard...', 'blue');
    const dashboard = generateDashboardFromModules(modules);
    
    // Write README-DASHBOARD.md
    log(`💾 Escribiendo ${CONFIG.outputFile}...`, 'blue');
    fs.writeFileSync(CONFIG.outputFile, dashboard);
    log(`   ✅ Dashboard guardado`, 'green');
    
    // Update project_data.json
    log(`💾 Actualizando ${CONFIG.dataFile}...`, 'blue');
    const phases = {};
    modules.forEach(mod => {
      if (!phases[mod.phase]) {
        phases[mod.phase] = { modules: [], order: mod.phaseOrder };
      }
      phases[mod.phase].modules.push(mod);
    });
    
    const phaseList = Object.entries(phases)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([name, data]) => {
        const progress = data.modules.reduce((sum, m) => sum + m.progress, 0) / data.modules.length;
        const statusCounts = data.modules.reduce((acc, m) => {
          acc[m.status] = (acc[m.status] || 0) + 1;
          return acc;
        }, {});
        return {
          name,
          order: data.order,
          progress,
          modules: data.modules,
          statusCounts
        };
      });
    
    const overallProgress = modules.reduce((sum, m) => sum + m.progress, 0) / modules.length;
    
    const projectData = {
      projectName: 'AMI-SYSTEM Progress',
      lastUpdated: new Date().toISOString(),
      overallProgress,
      phases: phaseList,
      needsAction: modules
        .filter(m => m.needs && m.needs.trim() !== '-' && m.needs.trim() !== '---' && m.needs.trim() !== '')
        .map(m => ({
          module: m.name,
          phase: m.phase,
          detail: m.needs
        }))
    };
    
    fs.mkdirSync(path.dirname(CONFIG.dataFile), { recursive: true });
    fs.writeFileSync(CONFIG.dataFile, JSON.stringify(projectData, null, 2));
    log(`   ✅ Datos JSON actualizados`, 'green');
    
    // Final summary
    log('', 'green');
    log('✅ Dashboard generado exitosamente!', 'green');
    log(`   Módulos: ${modules.length}`, 'green');
    log(`   Progreso general: ${overallProgress.toFixed(1)}%`, 'green');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = { generateDashboardFromModules };
