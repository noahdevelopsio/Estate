export interface Property {
    id: string;
    name: string;
    address: string;
    city: string;
    type: 'residential' | 'commercial' | 'mixed';
    totalUnits: number;
    occupiedUnits: number;
    monthlyRevenue: number;
    image: string;
}

export interface Tenant {
    id: string;
    name: string;
    email: string;
    phone: string;
    unit: string;
    property: string;
    leaseEnd: string;
    rentAmount: number;
    status: 'active' | 'pending' | 'overdue';
    avatar?: string;
}

export interface WorkOrder {
    id: string;
    title: string;
    property: string;
    unit: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'submitted' | 'assigned' | 'in-progress' | 'completed' | 'closed';
    category: string;
    createdAt: string;
    assignedTo?: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    occupancyRate: number;
    outstandingPayments: number;
    collectionRate: number;
}

export type UserRole = 'super_admin' | 'property_manager' | 'finance_manager' | 'maintenance_staff' | 'tenant';
