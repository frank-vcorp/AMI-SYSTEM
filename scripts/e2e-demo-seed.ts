#!/usr/bin/env npx ts-node
/**
 * E2E Demo Seed Script para FASE 1
 * 
 * Propósito: Llenar la BD con datos realistas para demostración del jueves
 * Flujo: Cita (CHECK_IN) → Expediente → Estudios → Validación → Reporte
 * 
 * Uso:
 *   npx ts-node scripts/e2e-demo-seed.ts
 * 
 * Limpia: Si quieres borrar datos, ejecuta:
 *   npx ts-node scripts/e2e-demo-seed.ts --clean
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT_ID = 'demo-clinic-001'; // Tenant único para demo

// Nombres de pacientes para demo (sin faker)
const PATIENT_NAMES = [
  'Juan Carlos García López',
  'María Fernanda Rodríguez',
  'Roberto Pérez García',
  'Ana María Martínez',
  'Luis Antonio Hernández',
  'Sofía Elena López',
  'Carlos Manuel Ruiz',
  'Patricia Alejandra Gómez',
  'Francisco Javier Sánchez',
  'Rosa María Flores',
];

async function main() {
  console.log('🌱 Iniciando E2E Demo Seed para FASE 1...\n');

  try {
    // 1. Crear Clínicas (3)
    console.log('📍 1. Creando clínicas...');
    const clinics = await Promise.all([
      prisma.clinic.create({
        data: {
          tenantId: TENANT_ID,
          code: 'CLI-CDMX-01',
          name: 'Clínica Centro México DF',
          address: 'Paseo de la Reforma 505, CDMX',
          phone: '+52-55-1234-5678',
          latitude: 25.6867,
          longitude: -100.3161,
          capacity: 50,
          operatingHours: {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '08:00', close: '18:00' },
            saturday: { open: '09:00', close: '14:00' },
            sunday: null,
          },
        },
      }),
      prisma.clinic.create({
        data: {
          tenantId: TENANT_ID,
          code: 'CLI-MTY-01',
          name: 'Clínica Monterrey Norte',
          address: 'Avenida Fundidora 500, MTY',
          phone: '+52-81-5678-9012',
          latitude: 25.6866,
          longitude: -100.3165,
          capacity: 40,
          operatingHours: {
            monday: { open: '07:00', close: '19:00' },
            tuesday: { open: '07:00', close: '19:00' },
            wednesday: { open: '07:00', close: '19:00' },
            thursday: { open: '07:00', close: '19:00' },
            friday: { open: '07:00', close: '19:00' },
            saturday: null,
            sunday: null,
          },
        },
      }),
      prisma.clinic.create({
        data: {
          tenantId: TENANT_ID,
          code: 'CLI-GDL-01',
          name: 'Clínica Guadalajara Sur',
          address: 'Avenida México 2500, GDL',
          phone: '+52-33-9123-4567',
          latitude: 20.6596,
          longitude: -103.2494,
          capacity: 35,
          operatingHours: {
            monday: { open: '08:00', close: '17:00' },
            tuesday: { open: '08:00', close: '17:00' },
            wednesday: { open: '08:00', close: '17:00' },
            thursday: { open: '08:00', close: '17:00' },
            friday: { open: '08:00', close: '17:00' },
            saturday: null,
            sunday: null,
          },
        },
      }),
    ]);
    console.log(`✅ ${clinics.length} clínicas creadas\n`);

    // 2. Crear Empresas (5)
    console.log('🏢 2. Creando empresas...');
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          tenantId: TENANT_ID,
          code: 'EMP-AUTOSP-001',
          name: 'AutoSoluciones Premium S.A.',
          industry: 'MANUFACTURING',
          rfc: 'ASP200101ABC',
          employees: 250,
          riskLevel: 'HIGH',
          status: 'ACTIVE',
        },
      }),
      prisma.company.create({
        data: {
          tenantId: TENANT_ID,
          code: 'EMP-TECHIN-001',
          name: 'TechInnovate Solutions S.A.S.',
          industry: 'TECHNOLOGY',
          rfc: 'TIS200102DEF',
          employees: 150,
          riskLevel: 'MEDIUM',
          status: 'ACTIVE',
        },
      }),
      prisma.company.create({
        data: {
          tenantId: TENANT_ID,
          code: 'EMP-LOGIST-001',
          name: 'Logística Global Express',
          industry: 'TRANSPORTATION',
          rfc: 'LGE200103GHI',
          employees: 400,
          riskLevel: 'HIGH',
          status: 'ACTIVE',
        },
      }),
      prisma.company.create({
        data: {
          tenantId: TENANT_ID,
          code: 'EMP-RETAIL-001',
          name: 'RetailMax Nacional',
          industry: 'RETAIL',
          rfc: 'RMN200104JKL',
          employees: 800,
          riskLevel: 'LOW',
          status: 'ACTIVE',
        },
      }),
      prisma.company.create({
        data: {
          tenantId: TENANT_ID,
          code: 'EMP-CONSTR-001',
          name: 'Constructora Horizonte',
          industry: 'CONSTRUCTION',
          rfc: 'CHZ200105MNO',
          employees: 320,
          riskLevel: 'HIGH',
          status: 'ACTIVE',
        },
      }),
    ]);
    console.log(`✅ ${companies.length} empresas creadas\n`);

    // 3. Crear Servicios/Baterías (Paquetes de estudios)
    console.log('🔬 3. Creando servicios y baterías...');
    const services = await Promise.all([
      prisma.service.create({
        data: {
          tenantId: TENANT_ID,
          code: 'SRV-BASIC',
          name: 'Examen Básico',
          category: 'OCCUPATIONAL_HEALTH',
          description: 'Vitales + historia clínica',
          price: 500,
          status: 'ACTIVE',
        },
      }),
      prisma.service.create({
        data: {
          tenantId: TENANT_ID,
          code: 'SRV-STANDARD',
          name: 'Examen Estándar',
          category: 'OCCUPATIONAL_HEALTH',
          description: 'Vitales + lab básico + radiografía',
          price: 1200,
          status: 'ACTIVE',
        },
      }),
      prisma.service.create({
        data: {
          tenantId: TENANT_ID,
          code: 'SRV-ADVANCED',
          name: 'Examen Avanzado',
          category: 'OCCUPATIONAL_HEALTH',
          description: 'Vitales + lab completo + radiografía + ECG + espirometría',
          price: 2500,
          status: 'ACTIVE',
        },
      }),
    ]);

    const serviceBatteries = await Promise.all([
      prisma.serviceBattery.create({
        data: {
          tenantId: TENANT_ID,
          code: 'BAT-BASIC',
          name: 'Batería Básica',
          description: 'Para puestos de bajo riesgo',
          items: {
            create: [
              {
                itemCode: 'SRV-VITAL',
                itemName: 'Toma de Vitales',
                quantity: 1,
              },
            ],
          },
          estimatedMinutes: 15,
          status: 'ACTIVE',
        },
      }),
      prisma.serviceBattery.create({
        data: {
          tenantId: TENANT_ID,
          code: 'BAT-STANDARD',
          name: 'Batería Estándar',
          description: 'Para puestos de riesgo medio',
          items: {
            create: [
              { itemCode: 'SRV-VITAL', itemName: 'Toma de Vitales', quantity: 1 },
              { itemCode: 'SRV-LAB-BASIC', itemName: 'Laboratorio Básico', quantity: 1 },
              { itemCode: 'SRV-XRY', itemName: 'Radiografía de Tórax', quantity: 1 },
            ],
          },
          estimatedMinutes: 45,
          status: 'ACTIVE',
        },
      }),
      prisma.serviceBattery.create({
        data: {
          tenantId: TENANT_ID,
          code: 'BAT-ADVANCED',
          name: 'Batería Avanzada',
          description: 'Para puestos de alto riesgo',
          items: {
            create: [
              { itemCode: 'SRV-VITAL', itemName: 'Toma de Vitales', quantity: 1 },
              { itemCode: 'SRV-LAB-FULL', itemName: 'Laboratorio Completo', quantity: 1 },
              { itemCode: 'SRV-XRY', itemName: 'Radiografía de Tórax', quantity: 1 },
              { itemCode: 'SRV-ECG', itemName: 'Electrocardiograma', quantity: 1 },
              { itemCode: 'SRV-SPIRO', itemName: 'Espirometría', quantity: 1 },
            ],
          },
          estimatedMinutes: 90,
          status: 'ACTIVE',
        },
      }),
    ]);
    console.log(`✅ ${services.length} servicios + ${serviceBatteries.length} baterías creadas\n`);

    // 4. Crear Citas (CHECK_IN) - 10 citas para demostración
    console.log('📅 4. Creando citas en estado CHECK_IN...');
    const appointmentDates = [
      new Date('2026-01-23T08:00:00'),
      new Date('2026-01-23T09:30:00'),
      new Date('2026-01-23T11:00:00'),
      new Date('2026-01-23T14:00:00'),
      new Date('2026-01-23T15:30:00'),
      new Date('2026-01-24T08:00:00'),
      new Date('2026-01-24T10:00:00'),
      new Date('2026-01-24T13:00:00'),
      new Date('2026-01-24T14:30:00'),
      new Date('2026-01-24T16:00:00'),
    ];

    const appointments = await Promise.all(
      appointmentDates.map((date, idx) =>
        prisma.appointment.create({
          data: {
            tenantId: TENANT_ID,
            clinicId: clinics[idx % clinics.length].id,
            companyId: companies[idx % companies.length].id,
            employeeId: `EMP-${String(idx + 1).padStart(4, '0')}`, // EMP-0001, EMP-0002, etc.
            employeeName: PATIENT_NAMES[idx % PATIENT_NAMES.length],
            appointmentDate: date,
            status: 'CHECK_IN', // Cita ya realizada (check-in)
            serviceBatteryId: serviceBatteries[idx % serviceBatteries.length].id,
            notes: idx % 3 === 0 ? 'Paciente con alergias a penicilina' : null,
          },
        })
      )
    );
    console.log(`✅ ${appointments.length} citas creadas en estado CHECK_IN\n`);

    // 5. Crear Expedientes (desde citas CHECK_IN)
    console.log('📋 5. Creando expedientes...');
    const expedients = await Promise.all(
      appointments.slice(0, 5).map((apt, idx) =>
        prisma.expedient.create({
          data: {
            tenantId: TENANT_ID,
            appointmentId: apt.id,
            companyId: apt.companyId,
            clinicId: apt.clinicId,
            patientId: apt.employeeId,
            patientName: apt.employeeName,
            folio: `EXP-${clinics[idx].code}-${Date.now()}-${idx}`,
            status: 'IN_PROGRESS',
            medicalExams: {
              create: {
                bloodPressure: `${120 + idx * 5}/${80 + idx * 2}`,
                heartRate: 72 + idx * 2,
                temperature: 36.5 + idx * 0.1,
                weight: 75 + idx * 3,
                height: 170 + idx,
                physicalExamFindings: 'Paciente en buen estado general',
              },
            },
          },
        })
      )
    );
    console.log(`✅ ${expedients.length} expedientes creados con exámenes médicos\n`);

    // 6. Agregar Estudios (Studies/Files) a los expedientes
    console.log('📎 6. Agregando estudios a expedientes...');
    const studyTypes = ['Radiografía de Tórax', 'Análisis de Sangre', 'Electrocardiograma', 'Espirometría'];
    const studies = await Promise.all(
      expedients.flatMap((exp, expIdx) =>
        [0, 1].map((studyIdx) =>
          prisma.study.create({
            data: {
              expedientId: exp.id,
              tenantId: TENANT_ID,
              studyType: studyTypes[(expIdx + studyIdx) % studyTypes.length],
              fileKey: `${TENANT_ID}/studies/${exp.id}/${Date.now()}-demo-file-${studyIdx}.pdf`,
              fileName: `${studyTypes[(expIdx + studyIdx) % studyTypes.length]}-${Date.now()}.pdf`,
              uploadedAt: new Date(),
              extractedData: null,
            },
          })
        )
      )
    );
    console.log(`✅ ${studies.length} estudios/archivos agregados\n`);

    // 7. Crear Validaciones (Pending)
    console.log('✅ 7. Creando tareas de validación...');
    const validationTasks = await Promise.all(
      expedients.map((exp) =>
        prisma.validationTask.create({
          data: {
            tenantId: TENANT_ID,
            expedientId: exp.id,
            status: 'PENDING',
            extractedDataSet: {
              bloodPressure: '120/80',
              heartRate: 72,
              labResults: {
                glucose: 100,
                cholesterol: 180,
              },
            },
            semaphoreStatus: 'YELLOW', // Por validar
            medicalOpinion: null,
            signatureCanvas: null,
            createdAt: new Date(),
          },
        })
      )
    );
    console.log(`✅ ${validationTasks.length} tareas de validación creadas\n`);

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('🎉 E2E DEMO DATA SEED COMPLETADO');
    console.log('='.repeat(60));
    console.log('\n📊 Resumen de Datos Creados:');
    console.log(`   • Clínicas: ${clinics.length}`);
    console.log(`   • Empresas: ${companies.length}`);
    console.log(`   • Servicios/Baterías: ${services.length} / ${serviceBatteries.length}`);
    console.log(`   • Citas (CHECK_IN): ${appointments.length}`);
    console.log(`   • Expedientes: ${expedients.length}`);
    console.log(`   • Estudios/Archivos: ${studies.length}`);
    console.log(`   • Tareas de Validación: ${validationTasks.length}`);
    console.log('\n📍 Tenant para Demo: ' + TENANT_ID);
    console.log('\n🧪 Puedes probar el flujo E2E en:');
    console.log('   1. http://localhost:3000/admin/citas → Seleccionar un CHECK_IN');
    console.log('   2. Click "Generar Expediente"');
    console.log('   3. http://localhost:3000/admin/expedientes → Ver expediente creado');
    console.log('   4. Agregar estudios/archivos');
    console.log('   5. http://localhost:3000/admin/validaciones → Validar con semáforo');
    console.log('\n✅ Ready for Thursday demo!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error durante seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
