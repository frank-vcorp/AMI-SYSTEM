import { PrismaClient, ClinicStatus } from '@prisma/client';

const prisma = new PrismaClient();

// MVP Demo tenant ID
const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

async function seedClinics() {
    console.log('🌱 Seeding AMI Branches...');

    const branches = [
        {
            name: 'AMI - Paseo del Prado',
            address: 'Paseo del Prado 121, Col. Del Prado',
            city: 'Querétaro',
            state: 'Querétaro',
            zipCode: '76030',
            phoneNumber: '(442) 480 29 03',
            email: 'informes@medicaindustrial.com',
            isHeadquarters: true,
        },
        {
            name: 'AMI - El Marqués',
            address: 'Local 11 Plaza Comercial, Parque Industrial El Marqués',
            city: 'El Marqués',
            state: 'Querétaro',
            zipCode: '76240',
            phoneNumber: '(442) 480 29 03',
            email: 'informes@medicaindustrial.com',
            isHeadquarters: false,
        },
        {
            name: 'AMI - Koonol del Puerto',
            address: 'COMERCIAL KOONOL DEL PUERTO, PLAZAS Carr. Estatal 500, Chichimequillas no 3900 int 10 Col, Puerto de Aguirre',
            city: 'Puerto de Aguirre',
            state: 'Querétaro',
            zipCode: '76220',
            phoneNumber: '(442) 480 29 03',
            email: 'informes@medicaindustrial.com',
            isHeadquarters: false,
        }
    ];

    for (const branch of branches) {
        await prisma.clinic.upsert({
            where: {
                tenantId_name: {
                    tenantId: DEFAULT_TENANT_ID,
                    name: branch.name,
                },
            },
            update: branch,
            create: {
                ...branch,
                tenantId: DEFAULT_TENANT_ID,
                status: ClinicStatus.ACTIVE,
            },
        });
        console.log(`✅ Branch ${branch.name} seeded.`);
    }

    console.log('✨ All AMI Branches have been seeded.');
}

seedClinics()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
