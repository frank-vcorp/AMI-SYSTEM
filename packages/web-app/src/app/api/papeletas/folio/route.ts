/**
 * @impl IMPL-20260121-A4
 * @ref context/Plan-Demo-RD-20260121.md
 * POST /api/papeletas/folio - Generate unique folio for expedient
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateFolio } from '@ami/core-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, clinicId } = body;

    if (!tenantId || !clinicId) {
      return NextResponse.json(
        { error: 'tenantId and clinicId are required' },
        { status: 400 }
      );
    }

    const result = await generateFolio({ tenantId, clinicId });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
