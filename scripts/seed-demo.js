/**
 * Seed de datos de demo para AMI System
 * Ejecutar: DATABASE_URL="..." node scripts/seed-demo.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

async function seed() {
  console.log('🌱 Creando datos de demo para AMI System...\n');
  
  try {
    // 1. Verificar/Crear Clínica
    let clinic = await prisma.clinic.findFirst({ where: { tenantId: TENANT_ID }});
    if (!clinic) {
      clinic = await prisma.clinic.create({
        data: {
          tenantId: TENANT_ID,
          name: 'Clínica AMI Central',
          address: 'Av. Principal 123',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '06600',
          phoneNumber: '55-1234-5678',
          email: 'contacto@ami-central.com',
          isHeadquarters: true,
          status: 'ACTIVE',
        },
      });
      console.log('✓ Clínica creada:', clinic.name);
    } else {
      console.log('✓ Clínica existente:', clinic.name);
    }

    // 2. Verificar/Crear Empresa
    let company = await prisma.company.findFirst({ where: { tenantId: TENANT_ID }});
    if (!company) {
      company = await prisma.company.create({
        data: {
          tenantId: TENANT_ID,
          name: 'PEMEX Exploración',
          rfc: 'PEX850101XXX',
          address: 'Av. Marina Nacional 329',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '11320',
          contactPerson: 'Ing. Roberto Hernández',
          email: 'rhernandez@pemex.com',
          phoneNumber: '55-9876-5432',
          status: 'ACTIVE',
        },
      });
      console.log('✓ Empresa creada:', company.name);
    } else {
      console.log('✓ Empresa existente:', company.name);
    }

    // 3. Crear Pacientes (si no existen)
    const patientCount = await prisma.patient.count({ where: { tenantId: TENANT_ID }});
    if (patientCount === 0) {
      const patients = await Promise.all([
        prisma.patient.create({
          data: {
            tenantId: TENANT_ID,
            name: 'Juan Carlos Pérez González',
            documentType: 'CURP',
            documentNumber: 'PEGJ850315HDFRRL09',
            dateOfBirth: new Date('1985-03-15'),
            gender: 'M',
            phoneNumber: '55-1111-2222',
            email: 'jperez@email.com',
            address: 'Calle Reforma 456',
            city: 'Ciudad de México',
            state: 'CDMX',
            companyId: company.id,
            status: 'ACTIVE',
          },
        }),
        prisma.patient.create({
          data: {
            tenantId: TENANT_ID,
            name: 'María Elena López Sánchez',
            documentType: 'CURP',
            documentNumber: 'LOSM900720MDFPNR05',
            dateOfBirth: new Date('1990-07-20'),
            gender: 'F',
            phoneNumber: '55-3333-4444',
            email: 'mlopez@email.com',
            address: 'Av. Insurgentes 789',
            city: 'Ciudad de México',
            state: 'CDMX',
            companyId: company.id,
            status: 'ACTIVE',
          },
        }),
        prisma.patient.create({
          data: {
            tenantId: TENANT_ID,
            name: 'Carlos Alberto Ruiz Martínez',
            documentType: 'CURP',
            documentNumber: 'RUMC881105HDFRRT08',
            dateOfBirth: new Date('1988-11-05'),
            gender: 'M',
            phoneNumber: '55-5555-6666',
            email: 'cruiz@email.com',
            address: 'Blvd. Ávila Camacho 321',
            city: 'Ciudad de México',
            state: 'CDMX',
            companyId: company.id,
            status: 'ACTIVE',
          },
        }),
      ]);
      console.log('✓ Pacientes creados:', patients.length);
    } else {
      console.log('✓ Pacientes existentes:', patientCount);
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('   - Tenant:', TENANT_ID);
    console.log('   - Clínica:', clinic.name);
    console.log('   - Empresa:', company.name);
    
    const finalPatientCount = await prisma.patient.count({ where: { tenantId: TENANT_ID }});
    console.log('   - Pacientes:', finalPatientCount);

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
