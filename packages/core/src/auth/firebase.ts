// Simplified Firebase setup - Placeholder until FASE 0.5 Infra is complete
export const auth = {
  verifyIdToken: async (token: string) => {
    // Mock implementation
    if (token === 'valid-token') {
      return { uid: 'mock-user-id', email: 'test@ami-system.com' };
    }
    throw new Error('Invalid token');
  }
};
