/**
 * @impl IMPL-20260202-A1
 * Dashboard statistics and metrics service
 */

import { prisma } from '../index';

export interface DashboardMetrics {
    patientsInProcess: number;
    dictamesHoy: number;
    averageTAT: string;
    iaAccuracy: number;
    expedientsByStatus: Record<string, number>;
    productivityByClinic: Array<{
        clinicName: string;
        count: number;
    }>;
}

/**
 * Get core metrics for the admin dashboard
 */
export async function getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Patients in Process (Expedients not COMPLETED or ARCHIVED)
    const patientsInProcess = await prisma.expedient.count({
        where: {
            tenantId,
            status: {
                in: [
                    'CHECKED_IN', 'IN_PHYSICAL_EXAM', 'EXAM_COMPLETED',
                    'AWAITING_STUDIES', 'STUDIES_UPLOADED', 'DATA_EXTRACTED',
                    'READY_FOR_REVIEW', 'IN_VALIDATION'
                ]
            }
        }
    });

    // 2. Dictames Hoy (ValidationTasks signed today)
    const dictamesHoy = await prisma.validationTask.count({
        where: {
            tenantId,
            status: 'SIGNED',
            signedAt: {
                gte: startOfToday
            }
        }
    });

    // 3. Average TAT (Turnaround Time)
    // For simplicity, average of last 50 completed tasks
    const lastCompletedTasks = await prisma.validationTask.findMany({
        where: {
            tenantId,
            status: 'SIGNED',
            signedAt: { not: null }
        },
        take: 50,
        orderBy: { signedAt: 'desc' },
        select: { createdAt: true, signedAt: true }
    });

    let averageTAT = '0.0 hrs';
    if (lastCompletedTasks.length > 0) {
        const totalMs = lastCompletedTasks.reduce((acc, task) => {
            return acc + (task.signedAt!.getTime() - task.createdAt.getTime());
        }, 0);
        const avgHrs = (totalMs / lastCompletedTasks.length) / (1000 * 60 * 60);
        averageTAT = `${avgHrs.toFixed(1)} hrs`;
    }

    // 4. Expedients by Status
    const statusCounts = await prisma.expedient.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true }
    });

    const expedientsByStatus: Record<string, number> = {
        PENDING: 0,
        IN_PROGRESS: 0,
        STUDIES_PENDING: 0,
        VALIDATED: 0,
        COMPLETED: 0,
        ARCHIVED: 0
    };

    statusCounts.forEach(c => {
        expedientsByStatus[c.status] = c._count.status;
    });

    // 5. Productivity by Clinic
    const clinicProductivity = await prisma.clinic.findMany({
        where: { tenantId },
        select: {
            name: true,
            _count: {
                select: {
                    expedients: {
                        where: {
                            status: { in: ['VALIDATED', 'DELIVERED', 'ARCHIVED'] }
                        }
                    }
                }
            }
        },
        take: 5
    });

    const productivityByClinic = clinicProductivity.map(cp => ({
        clinicName: cp.name,
        count: cp._count.expedients
    }));

    return {
        patientsInProcess,
        dictamesHoy,
        averageTAT,
        iaAccuracy: 94.5, // Placeholder for now
        expedientsByStatus,
        productivityByClinic
    };
}
