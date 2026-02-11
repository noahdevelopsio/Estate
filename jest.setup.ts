// Mock Next.js cache revalidatePath
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Mock Auth
jest.mock('@/lib/auth', () => ({
    auth: jest.fn(() => Promise.resolve({
        user: {
            id: 'test-user-id',
            email: 'owner@test.com',
            organizationId: 'test-org-id',
            role: 'SUPER_ADMIN',
            organizationName: 'Test Org'
        }
    }))
}));
