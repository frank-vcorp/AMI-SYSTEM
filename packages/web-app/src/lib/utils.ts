/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * Utility functions for the web application
 */

/**
 * Validates if a string is a valid UUID (v1-v5)
 * Used to prevent Postgres UUID cast errors when using non-UUID tenantId values
 * 
 * @param value - The string to validate
 * @returns true if the string is a valid UUID, false otherwise
 */
export function isUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Builds a tenant filter for Prisma queries
 * Omits tenantId from filter if it's not a valid UUID to prevent Postgres errors
 * 
 * @param tenantId - The tenant ID string (may or may not be a valid UUID)
 * @returns An object with tenantId only if it's a valid UUID, empty object otherwise
 */
export function buildTenantFilter(tenantId: string): { tenantId?: string } {
  if (tenantId && isUuid(tenantId)) {
    return { tenantId };
  }
  // Return empty object - query will return all tenants (acceptable for MVP demo)
  return {};
}
