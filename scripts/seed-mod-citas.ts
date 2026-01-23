/**
 * Seed Script para MOD-CITAS - Datos de Prueba
 * 
 * Crea datos de ejemplo en la BD para demostración:
 * - 3 clínicas
 * - Horarios de apertura
 * - 10 citas de ejemplo
 * 
 * Uso: npx tsx scripts/seed-mod-citas.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de MOD-CITAS...');

  // IDs para consistencia
  const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // UUID válido
  const companyId = '550e8400-e29b-41d4-a716-446655440001';

  try {
    // ========================================================================
    // 1. CREAR CLÍNICAS
    // ========================================================================
    console.log('📍 Creando clínicas...');

    const clinic1 = await prisma.clinic.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440010' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440010',
        tenantId,
        name: 'Clínica Central Madrid',
        address: 'Calle Gran Vía 123, Madrid',
        phone: '+34 91 123 4567',
        email: 'central@clinica.es',
        capacity: 30,
        isActive: true,
      }
    });

    const clinic2 = await prisma.clinic.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440011' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440011',
        tenantId,
        name: 'Clínica Metropolitana',
        address: 'Paseo de la Castellana 456, Madrid',
        phone: '+34 91 234 5678',
        email: 'metro@clinica.es',
        capacity: 25,
        isActive: true,
      }
    });

    const clinic3 = await prisma.clinic.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440012' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440012',
        tenantId,
        name: 'Clínica Atocha',
        address: 'Avenida Atocha 789, Madrid',
        phone: '+34 91 345 6789',
        email: 'atocha@clinica.es',
        capacity: 20,
        isActive: true,
      }
    });

    console.log(`✅ Clínicas creadas: ${clinic1.name}, ${clinic2.name}, ${clinic3.name}`);

    // ========================================================================
    // 2. CREAR HORARIOS DE CLÍNICAS
    // ========================================================================
    console.log('⏰ Creando horarios de apertura...');

    const schedules = [
      // Lunes a Viernes (dayOfWeek 1-5)
      { dayOfWeek: 1, openingTime: '08:00', closingTime: '18:00', lunchStartTime: '14:00', lunchEndTime: '15:00' },
      { dayOfWeek: 2, openingTime: '08:00', closingTime: '18:00', lunchStartTime: '14:00', lunchEndTime: '15:00' },
      { dayOfWeek: 3, openingTime: '08:00', closingTime: '18:00', lunchStartTime: '14:00', lunchEndTime: '15:00' },
      { dayOfWeek: 4, openingTime: '08:00', closingTime: '18:00', lunchStartTime: '14:00', lunchEndTime: '15:00' },
      { dayOfWeek: 5, openingTime: '08:00', closingTime: '18:00', lunchStartTime: '14:00', lunchEndTime: '15:00' },
      // Sábado (dayOfWeek 6)
      { dayOfWeek: 6, openingTime: '09:00', closingTime: '14:00', lunchStartTime: null, lunchEndTime: null },
    ];

    for (const clinic of [clinic1, clinic2, clinic3]) {
      for (const schedule of schedules) {
        await prisma.clinicSchedule.upsert({
          where: {
            clinicId_dayOfWeek: {
              clinicId: clinic.id,
              dayOfWeek: schedule.dayOfWeek
            }
          },
          update: {},
          create: {
            clinicId: clinic.id,
            dayOfWeek: schedule.dayOfWeek,
            openingTime: schedule.openingTime,
            closingTime: schedule.closingTime,
            lunchStartTime: schedule.lunchStartTime,
            lunchEndTime: schedule.lunchEndTime,
            isOpen: true,
          }
        });
      }
    }

    console.log('✅ Horarios creados para todas las clínicas');

    // ========================================================================
    // 3. CREAR CITAS DE EJEMPLO
    // ========================================================================
    console.log('📅 Creando citas de ejemplo...');

    const appointmentData = [
      {
        id: '550e8400-e29b-41d4-a716-446655440100',
        clinicId: clinic1.id,
        patientId: '550e8400-e29b-41d4-a716-446655440200',
        companyId,
        appointmentDate: new Date('2026-01-25'), // Sábado próximo
        time: '09:00',
        status: 'CONFIRMED' as const,
        notes: 'Examen ocupacional rutinario'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        clinicId: clinic1.id,
        patientId: '550e8400-e29b-41d4-a716-446655440201',
        companyId,
        appointmentDate: new Date('2026-01-25'),
        time: '10:00',
        status: 'CONFIRMED' as const,
        notes: 'Seguimiento médico'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        clinicId: clinic1.id,
        patientId: '550e8400-e29b-41d4-a716-446655440202',
        companyId,
        appointmentDate: new Date('2026-01-25'),
        time: '11:00',
        status: 'CONFIRMED' as const,
        notes: 'Pre-empleo'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        clinicId: clinic2.id,
        patientId: '550e8400-e29b-41d4-a716-446655440203',
        companyId,
        appointmentDate: new Date('2026-01-27'), // Lunes
        time: '09:00',
        status: 'PENDING' as const,
        notes: 'Reconocimiento médico anual'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440104',
        clinicId: clinic2.id,
        patientId: '550e8400-e29b-41d4-a716-446655440204',
        companyId,
        appointmentDate: new Date('2026-01-27'),
        time: '10:30',
        status: 'CONFIRMED' as const,
        notes: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440105',
        clinicId: clinic2.id,
        patientId: '550e8400-e29b-41d4-a716-446655440205',
        companyId,
        appointmentDate: new Date('2026-01-27'),
        time: '15:30',
        status: 'CONFIRMED' as const,
        notes: 'Post-licencia médica'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440106',
        clinicId: clinic3.id,
        patientId: '550e8400-e29b-41d4-a716-446655440206',
        companyId,
        appointmentDate: new Date('2026-01-28'),
        time: '08:00',
        status: 'CONFIRMED' as const,
        notes: 'Valoración de capacidad laboral'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440107',
        clinicId: clinic3.id,
        patientId: '550e8400-e29b-41d4-a716-446655440207',
        companyId,
        appointmentDate: new Date('2026-01-28'),
        time: '11:00',
        status: 'NO_SHOW' as const,
        notes: 'No asistió'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440108',
        clinicId: clinic1.id,
        patientId: '550e8400-e29b-41d4-a716-446655440208',
        companyId,
        appointmentDate: new Date('2026-01-29'),
        time: '09:30',
        status: 'CANCELLED' as const,
        notes: 'Cancelada por el paciente'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440109',
        clinicId: clinic2.id,
        patientId: '550e8400-e29b-41d4-a716-446655440209',
        companyId,
        appointmentDate: new Date('2026-01-30'),
        time: '13:00',
        status: 'CONFIRMED' as const,
        notes: 'Estudio complementario'
      }
    ];

    for (const apt of appointmentData) {
      await prisma.appointment.upsert({
        where: { id: apt.id },
        update: {},
        create: {
          id: apt.id,
          tenantId,
          clinicId: apt.clinicId,
          patientId: apt.employeeId,
          companyId: apt.companyId,
          appointmentDate: apt.appointmentDate,
          time: apt.time,
          status: apt.status,
          notes: apt.notes,
        }
      });
    }

    console.log(`✅ Citas creadas: ${appointmentData.length} citas de ejemplo`);

    // ========================================================================
    // 4. RESUMEN
    // ========================================================================
    console.log('\n✨ Seed completado:');
    console.log(`  📍 Clínicas: 3`);
    console.log(`  ⏰ Horarios: 18 (6 días × 3 clínicas)`);
    console.log(`  📅 Citas: ${appointmentData.length}`);
    console.log('\n🔍 Datos listos para demostración en /admin/citas');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
