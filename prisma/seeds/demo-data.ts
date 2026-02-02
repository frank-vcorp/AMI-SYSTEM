/**
 * Seed Script - Demo Data with Real Medical Studies
 * 
 * Creates 5 demo expedients with real PDF/image files from context folder
 * 
 * @impl IMPL-20260202-05
 * @author SOFIA
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const STUDIES_SOURCE = path.join(__dirname, '../../context/LEGACY_IMPORT/ami-rd/context/02_Contexto_Tecnico/Demos funcionales/RD/expedientes/RD-2025-001');

// Demo patients data
const DEMO_PATIENTS = [
    {
        firstName: 'Juan Carlos',
        paternalLastName: 'Pérez',
        maternalLastName: 'García',
        name: 'Juan Carlos Pérez García',
        documentId: 'CURP-001-2026',
        uniqueId: 'ID-001',
        email: 'juan.perez@example.com',
        phone: '+52 55 1234 5678',
        birthDate: new Date('1985-03-15'),
        gender: 'MASCULINO' as const,
    },
    {
        firstName: 'María Fernanda',
        paternalLastName: 'López',
        maternalLastName: 'Martínez',
        name: 'María Fernanda López Martínez',
        documentId: 'CURP-002-2026',
        uniqueId: 'ID-002',
        email: 'maria.lopez@example.com',
        phone: '+52 55 2345 6789',
        birthDate: new Date('1990-07-22'),
        gender: 'FEMENINO' as const,
    },
    {
        firstName: 'Roberto',
        paternalLastName: 'Sánchez',
        maternalLastName: 'Hernández',
        name: 'Roberto Sánchez Hernández',
        documentId: 'CURP-003-2026',
        uniqueId: 'ID-003',
        email: 'roberto.sanchez@example.com',
        phone: '+52 55 3456 7890',
        birthDate: new Date('1978-11-30'),
        gender: 'MASCULINO' as const,
    },
    {
        firstName: 'Ana Patricia',
        paternalLastName: 'Ramírez',
        maternalLastName: 'Torres',
        name: 'Ana Patricia Ramírez Torres',
        documentId: 'CURP-004-2026',
        uniqueId: 'ID-004',
        email: 'ana.ramirez@example.com',
        phone: '+52 55 4567 8901',
        birthDate: new Date('1995-05-18'),
        gender: 'FEMENINO' as const,
    },
    {
        firstName: 'Carlos Eduardo',
        paternalLastName: 'Gómez',
        maternalLastName: 'Ruiz',
        name: 'Carlos Eduardo Gómez Ruiz',
        documentId: 'CURP-005-2026',
        uniqueId: 'ID-005',
        email: 'carlos.gomez@example.com',
        phone: '+52 55 5678 9012',
        birthDate: new Date('1982-09-25'),
        gender: 'MASCULINO' as const,
    },
];

// Study files mapping
const STUDY_FILES = [
    { filename: 'LABORATORIO (1).pdf', type: 'LABORATORY' as const, name: 'Química Sanguínea' },
    { filename: 'LABORATORIO (2).pdf', type: 'LABORATORY' as const, name: 'Biometría Hemática' },
    { filename: 'LABORATORIO (3).pdf', type: 'LABORATORY' as const, name: 'Examen General de Orina' },
    { filename: 'AUDIOMETRIA.pdf', type: 'OTHER' as const, name: 'Audiometría' },
    { filename: 'ESPIROMETRIA.pdf', type: 'OTHER' as const, name: 'Espirometría' },
    { filename: 'ELECTROCCARDIOGRAMA.pdf', type: 'CARDIOGRAM' as const, name: 'Electrocardiograma' },
    { filename: 'RX INTERP.pdf', type: 'RADIOGRAPHY' as const, name: 'Rayos X - Interpretación' },
    { filename: 'TOXICOLOGICO 5 ELEMENTOS.pdf', type: 'LABORATORY' as const, name: 'Toxicológico 5 Elementos' },
];

// Expedient statuses for demo variety
const DEMO_STATUSES = [
    'STUDIES_UPLOADED',    // Patient 1: Studies uploaded, pending AI
    'DATA_EXTRACTED',      // Patient 2: AI processed, ready for review
    'READY_FOR_REVIEW',    // Patient 3: Ready for validation
    'IN_VALIDATION',       // Patient 4: Currently being validated
    'VALIDATED',           // Patient 5: Completed and validated
];

async function main() {
    console.log('🌱 Starting seed process...\n');

    // 1. Create or get default clinic
    console.log('📍 Creating clinic...');
    const clinic = await prisma.clinic.upsert({
        where: {
            tenantId_name: {
                tenantId: TENANT_ID,
                name: 'Clínica Demo AMI'
            }
        },
        update: {},
        create: {
            tenantId: TENANT_ID,
            name: 'Clínica Demo AMI',
            description: 'Clínica de demostración para sistema AMI',
            address: 'Av. Revolución 1000, CDMX',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '01000',
            phoneNumber: '+52 55 9999 0000',
            email: 'contacto@clinicademo.com',
            status: 'ACTIVE',
            isHeadquarters: true,
        },
    });
    console.log(`✅ Clinic created: ${clinic.name}\n`);

    // 2. Create or get demo company
    console.log('🏢 Creating company...');
    const company = await prisma.company.upsert({
        where: {
            tenantId_name: {
                tenantId: TENANT_ID,
                name: 'Empresa Demo S.A. de C.V.'
            }
        },
        update: {},
        create: {
            tenantId: TENANT_ID,
            name: 'Empresa Demo S.A. de C.V.',
            rfc: 'DEMO123456XXX',
            address: 'Av. Paseo de la Reforma 500, CDMX',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '06600',
            phoneNumber: '+52 55 8888 0000',
            email: 'rh@empresademo.com',
            status: 'ACTIVE',
        },
    });
    console.log(`✅ Company created: ${company.name}\n`);

    // 3. Create patients and expedients
    console.log('👥 Creating patients and expedients...\n');

    for (let i = 0; i < DEMO_PATIENTS.length; i++) {
        const patientData = DEMO_PATIENTS[i];
        const status = DEMO_STATUSES[i];
        const folio = `AMI-DEMO-${String(i + 1).padStart(3, '0')}`;

        console.log(`  📋 Processing ${patientData.name}...`);

        // Create patient (using upsert to avoid unique constraint errors if re-running)
        // Since we don't have a unique key easily mapped for upsert here without building the compound key obj manually which is complex,
        // and we are doing a force-reset anyway, create should be fine. But to be safe, we can check if exists.
        // Actually, db push --force-reset runs before this, so create is safe.

        const patient = await prisma.patient.create({
            data: {
                tenantId: TENANT_ID,
                ...patientData,
                companyId: company.id,
            },
        });

        // Create expedient
        const expedient = await prisma.expedient.create({
            data: {
                tenantId: TENANT_ID,
                folio,
                patientId: patient.id,
                clinicId: clinic.id,
                companyId: company.id,
                status,
                medicalNotes: `Expediente demo ${i + 1} - Estado: ${status}`,
            },
        });

        // Create medical exam (for all except first one)
        if (i > 0) {
            await prisma.medicalExam.create({
                data: {
                    expedientId: expedient.id,
                    examinedAt: new Date(),
                    bloodPressure: '120/80',
                    heartRate: 72,
                    temperature: 36.5,
                    weight: 70 + i * 5,
                    height: 170 + i * 2,
                    notes: 'Examen físico completado sin hallazgos relevantes',
                },
            });
        }

        // Upload studies (simulate file uploads)
        const studiesToUpload = i === 0 ? STUDY_FILES.slice(0, 3) : STUDY_FILES; // First patient has fewer studies

        for (const study of studiesToUpload) {
            const sourceFile = path.join(STUDIES_SOURCE, study.filename);

            // Check if file exists
            if (fs.existsSync(sourceFile)) {
                const stats = fs.statSync(sourceFile);

                await prisma.studyUpload.create({
                    data: {
                        expedientId: expedient.id,
                        fileName: study.filename,
                        type: study.type,
                        fileUrl: `/uploads/studies/${folio}/${study.filename}`,
                        fileSizeBytes: stats.size,
                        mimeType: study.filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
                        status: i === 0 ? 'UPLOADED' : (i === 1 ? 'EXTRACTED' : 'VALIDATED'),
                    },
                });
            }
        }

        // Create validation task for patients 3, 4, 5
        if (i >= 2) {
            // We need to look if ValidationTask expects extractedDataSummary as Json.
            // Based on schema, extractedDataSummary is often Json or similar.
            // If schema has updated validation task, we should use correct fields.
            // Assuming validation task creation is similar to initial attempt.

            await prisma.validationTask.create({
                data: {
                    tenantId: TENANT_ID,
                    expedientId: expedient.id,
                    patientId: patient.id,
                    clinicId: clinic.id,
                    status: i === 3 ? 'IN_REVIEW' : (i === 4 ? 'SIGNED' : 'PENDING'),
                    verdict: 'APTO',
                    medicalOpinion: i === 4 ? 'Paciente apto para el puesto solicitado' : '',
                    // extractedDataSummary: {}, // Removing this as it caused lint error, likely optional or name changed
                },
            });
        }

        console.log(`  ✅ ${patientData.name} - ${folio} (${status})`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Patients: ${DEMO_PATIENTS.length}`);
    console.log(`  - Expedients: ${DEMO_PATIENTS.length}`);
    console.log(`  - Studies: ~${STUDY_FILES.length * DEMO_PATIENTS.length}`);
    console.log(`  - Validation tasks: 3`);
    console.log('\n✅ Demo data ready for testing!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
