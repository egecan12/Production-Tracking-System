export type Employee = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
};

export type Machine = {
  id: string;
  name: string;
  model?: string;
  number?: string;
  location?: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at?: string;
  updated_at?: string;
};

export type WorkSession = {
  id: string;
  employee_id: string;
  machine_id: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductionLog = {
  id: string;
  employee_id: string;
  machine_id: string;
  order_id: string;
  quantity_produced: number;
  start_time: string;
  end_time: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type Customer = {
  id?: string;
  name: string;
  company_name?: string;
  contact_email?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
};

export type Order = {
  id: string;
  customer_id: string;
  product_specifications: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
};

export type WorkOrder = {
  id?: string;
  customerId: string;
  orderDate: Date;
  deliveryDate?: Date;
  refNo?: string;
  totalOrderWeight: number;
  totalOrderLength: number;
  productType: string;
  materialType: string;
  dimensionsWidth: number;
  dimensionsThickness: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at?: string;
  updated_at?: string;
};

export type Spool = {
  id?: string;
  workOrderId: string;
  spoolNumber: number;
  nakedWeight: number;
  length: number;
  diameter: number;
  spoolType: string;
  insulationWeight?: number;
  created_at?: string;
  updated_at?: string;
};

export type ProductionSpecification = {
  id?: string;
  workOrderId: string;
  paperType?: string;
  insulationThickness: number;
  productionSpeed: number;
  lineSpeed: number;
  paperLayers?: number;
  toleranceThickness: number;
  toleranceWidth: number;
  created_at?: string;
  updated_at?: string;
}; 