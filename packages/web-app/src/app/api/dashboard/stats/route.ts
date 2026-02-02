import { NextRequest, NextResponse } from 'next/server';
import { getDashboardMetrics } from '@ami/core-database';

/**
 * GET /api/dashboard/stats
 * Get real-time statistics for the dashboard
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        // For now we use the default fallback tenant, in production this comes from Auth
        const tenantId = searchParams.get('tenantId') || '550e8400-e29b-41d4-a716-446655440000';

        const metrics = await getDashboardMetrics(tenantId);

        return NextResponse.json(metrics, { status: 200 });
    } catch (error) {
        console.error('[GET /api/dashboard/stats]', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
