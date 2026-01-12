// Tenant Management
// Simplified context for FASE 0.5

const tenantStore = new Map<string, string>(); // async context store mock

export const tenantContext = {
    getTenantId: () => tenantStore.get('current') || 'default-tenant',
    setTenantId: (id: string) => tenantStore.set('current', id)
};
