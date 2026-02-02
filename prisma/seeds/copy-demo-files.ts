
import * as fs from 'fs';
import * as path from 'path';

const FOLIOS = [
    'AMI-DEMO-001',
    'AMI-DEMO-002',
    'AMI-DEMO-003',
    'AMI-DEMO-004',
    'AMI-DEMO-005'
];

const SOURCE_DIR = path.join(__dirname, '../../context/LEGACY_IMPORT/ami-rd/context/02_Contexto_Tecnico/Demos funcionales/RD/expedientes/RD-2025-001');
const DEST_BASE = path.join(__dirname, '../../packages/web-app/public/uploads/studies');

// Study files to copy
const FILES = [
    'LABORATORIO (1).pdf',
    'LABORATORIO (2).pdf',
    'LABORATORIO (3).pdf',
    'AUDIOMETRIA.pdf',
    'ESPIROMETRIA.pdf',
    'ELECTROCCARDIOGRAMA.pdf',
    'RX INTERP.pdf',
    'TOXICOLOGICO 5 ELEMENTOS.pdf'
];

async function main() {
    console.log('📂 Copying demo files to public folder...');

    if (!fs.existsSync(DEST_BASE)) {
        fs.mkdirSync(DEST_BASE, { recursive: true });
    }

    for (const folio of FOLIOS) {
        const destDir = path.join(DEST_BASE, folio);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        console.log(`  Processing ${folio}...`);

        for (const file of FILES) {
            const src = path.join(SOURCE_DIR, file);
            const dest = path.join(destDir, file);

            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                // console.log(`    Copied ${file}`);
            } else {
                console.warn(`    ⚠️ Source file not found: ${file}`);
            }
        }
    }

    console.log('✅ Files copied successfully!');
}

main();
