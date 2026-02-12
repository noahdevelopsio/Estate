import type { Property, Tenant, WorkOrder, FinancialSummary } from '@/types/estate';

export const mockProperties: Property[] = [
    { id: '1', name: 'Riverside Apartments', address: '120 River Road', city: 'Lagos', type: 'residential', totalUnits: 24, occupiedUnits: 21, monthlyRevenue: 4200000, image: '' },
    { id: '2', name: 'Marina Business Center', address: '45 Marina Drive', city: 'Lagos', type: 'commercial', totalUnits: 16, occupiedUnits: 14, monthlyRevenue: 8500000, image: '' },
    { id: '3', name: 'Palm Heights', address: '8 Palm Avenue', city: 'Abuja', type: 'residential', totalUnits: 32, occupiedUnits: 28, monthlyRevenue: 5600000, image: '' },
    { id: '4', name: 'Crescent Mall', address: '200 Crescent Blvd', city: 'Port Harcourt', type: 'mixed', totalUnits: 40, occupiedUnits: 35, monthlyRevenue: 12000000, image: '' },
    { id: '5', name: 'Greenfield Villas', address: '15 Greenfield Estate', city: 'Abuja', type: 'residential', totalUnits: 12, occupiedUnits: 12, monthlyRevenue: 3600000, image: '' },
    { id: '6', name: 'Lekki Office Park', address: '88 Lekki Expressway', city: 'Lagos', type: 'commercial', totalUnits: 20, occupiedUnits: 17, monthlyRevenue: 9200000, image: '' },
];

export const mockTenants: Tenant[] = [
    { id: '1', name: 'Adebayo Johnson', email: 'adebayo@email.com', phone: '+234 801 234 5678', unit: 'A-101', property: 'Riverside Apartments', leaseEnd: '2026-08-15', rentAmount: 200000, status: 'active' },
    { id: '2', name: 'Chidinma Okafor', email: 'chidinma@email.com', phone: '+234 802 345 6789', unit: 'B-205', property: 'Palm Heights', leaseEnd: '2026-03-01', rentAmount: 175000, status: 'active' },
    { id: '3', name: 'Emeka Nwosu', email: 'emeka@email.com', phone: '+234 803 456 7890', unit: 'C-302', property: 'Marina Business Center', leaseEnd: '2026-12-31', rentAmount: 530000, status: 'overdue' },
    { id: '4', name: 'Fatima Bello', email: 'fatima@email.com', phone: '+234 804 567 8901', unit: 'A-108', property: 'Riverside Apartments', leaseEnd: '2026-06-01', rentAmount: 200000, status: 'active' },
    { id: '5', name: 'Grace Eze', email: 'grace@email.com', phone: '+234 805 678 9012', unit: 'D-401', property: 'Crescent Mall', leaseEnd: '2026-09-30', rentAmount: 300000, status: 'pending' },
    { id: '6', name: 'Hassan Mohammed', email: 'hassan@email.com', phone: '+234 806 789 0123', unit: 'B-210', property: 'Palm Heights', leaseEnd: '2026-04-15', rentAmount: 175000, status: 'active' },
];

export const mockWorkOrders: WorkOrder[] = [
    { id: 'WO-001', title: 'Leaking pipe in bathroom', property: 'Riverside Apartments', unit: 'A-103', priority: 'high', status: 'in-progress', category: 'Plumbing', createdAt: '2026-02-10', assignedTo: 'Mike Plumbing Co.' },
    { id: 'WO-002', title: 'AC unit not cooling', property: 'Marina Business Center', unit: 'C-305', priority: 'medium', status: 'assigned', category: 'HVAC', createdAt: '2026-02-11', assignedTo: 'CoolTech Services' },
    { id: 'WO-003', title: 'Broken window lock', property: 'Palm Heights', unit: 'B-201', priority: 'low', status: 'submitted', category: 'General', createdAt: '2026-02-12' },
    { id: 'WO-004', title: 'Elevator maintenance', property: 'Crescent Mall', unit: 'Common', priority: 'urgent', status: 'in-progress', category: 'Elevator', createdAt: '2026-02-08', assignedTo: 'ElevatorPro Ltd.' },
    { id: 'WO-005', title: 'Paint touch-up hallway', property: 'Greenfield Villas', unit: 'Common', priority: 'low', status: 'completed', category: 'Painting', createdAt: '2026-02-05', assignedTo: 'In-house' },
    { id: 'WO-006', title: 'Water heater replacement', property: 'Riverside Apartments', unit: 'A-108', priority: 'high', status: 'submitted', category: 'Plumbing', createdAt: '2026-02-12' },
];

export const mockFinancials: FinancialSummary = {
    totalRevenue: 43100000,
    totalExpenses: 12800000,
    netIncome: 30300000,
    occupancyRate: 88.2,
    outstandingPayments: 3450000,
    collectionRate: 92.0,
};

export const mockRevenueData = [
    { month: 'Sep', revenue: 38200000, expenses: 11500000 },
    { month: 'Oct', revenue: 39800000, expenses: 12100000 },
    { month: 'Nov', revenue: 40500000, expenses: 11800000 },
    { month: 'Dec', revenue: 41200000, expenses: 13200000 },
    { month: 'Jan', revenue: 42500000, expenses: 12500000 },
    { month: 'Feb', revenue: 43100000, expenses: 12800000 },
];

export const mockOccupancyData = [
    { name: 'Occupied', value: 127, fill: 'hsl(172, 50%, 36%)' },
    { name: 'Vacant', value: 17, fill: 'hsl(220, 13%, 91%)' },
];
