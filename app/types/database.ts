export type Employee = {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export type Machine = {
  id: string
  name: string
  model: string
  status: 'active' | 'maintenance' | 'inactive'
  created_at: string
  updated_at: string
}

export type Customer = {
  id?: string
  name: string
  companyName?: string
  contactEmail?: string
  phoneNumber?: string
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  customer_id: string
  product_specifications: string
  quantity: number
  status: 'pending' | 'in_production' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export type ProductionLog = {
  id: string
  employee_id: string
  machine_id: string
  order_id: string
  quantity_produced: number
  start_time: string
  end_time: string
  notes: string
  created_at: string
  updated_at: string
}

export type WorkOrder = {
  id?: string
  customerId: string
  orderDate: Date
  deliveryDate?: Date
  refNo?: string
  totalOrderWeight: number
  totalOrderLength: number
  productType: string
  materialType: string
  dimensionsWidth: number
  dimensionsThickness: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  created_at: string
  updated_at: string
}

export type Spool = {
  id?: string
  workOrderId: string
  spoolNumber: number
  nakedWeight: number
  length: number
  diameter: number
  spoolType: string
  insulationWeight?: number
  created_at: string
  updated_at: string
}

export type ProductionSpecification = {
  id?: string
  workOrderId: string
  paperType?: string
  insulationThickness: number
  productionSpeed: number
  lineSpeed: number
  paperLayers?: number
  toleranceThickness: number
  toleranceWidth: number
  created_at: string
  updated_at: string
}

export type SystemAuth = {
  id: string
  username: string
  password_hash: string
  role: string
  created_at: string
  updated_at: string
} 