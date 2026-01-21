/**
 * @impl IMPL-20260121-A2
 * @ref context/Plan-Demo-RD-20260121.md
 * Folio generation service for Expedient
 */

import { prisma } from '../index';

interface GenerateFolioInput {
  tenantId: string;
  clinicId: string;
}

export interface GenerateFolioOutput {
  folio: string;
  qr: string; // data:image/png;base64,...
}

/**
 * Generate unique folio per tenant/clinic
 * Format: EXP-{STATE}-{YYYYMMDD}-{NNN}
 * State is extracted from clinic (example: CDMX, BAJ, NL, etc)
 */
export async function generateFolio(
  input: GenerateFolioInput
): Promise<GenerateFolioOutput> {
  const { tenantId, clinicId } = input;

  // Fetch clinic to get state (for folio prefix)
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { state: true },
  });

  if (!clinic) {
    throw new Error(`Clinic not found: ${clinicId}`);
  }

  // Extract state code (first 4 chars of state name or abbreviation)
  // Example: "Ciudad de México" -> "CDMX", "Baja California" -> "BAJA"
  const stateCode = clinic.state.substring(0, 4).toUpperCase();

  // Get today's date in YYYYMMDD format
  const now = new Date();
  const dateStr = now
    .toISOString()
    .split('T')[0]
    .replace(/-/g, ''); // YYYYMMDD

  // Count expedients created today for this tenant to generate sequential number
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const todayCount = await prisma.expedient.count({
    where: {
      tenantId,
      clinicId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Sequential number (padded to 3 digits)
  const sequentialNumber = String(todayCount + 1).padStart(3, '0');

  // Generate folio
  const folio = `EXP-${stateCode}-${dateStr}-${sequentialNumber}`;

  // Generate QR code (data URL)
  // For now, return placeholder - would use qrcode npm package in production
  const qrDataUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`; // 1x1 white pixel

  return {
    folio,
    qr: qrDataUrl,
  };
}

/**
 * Assign folio to existing expedient
 */
export async function assignFolioToExpedient(
  expedientId: string,
  folio: string
): Promise<void> {
  await prisma.expedient.update({
    where: { id: expedientId },
    data: { folio },
  });
}
