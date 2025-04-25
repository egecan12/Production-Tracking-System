import { supabase } from './supabase'
import type { Employee, Machine, Order, ProductionLog, Customer, WorkOrder, Spool, ProductionSpecification } from '../types'
import workOrderService from './workOrderService'

// Export WorkOrderService methods
export const {
  calculateProductionEfficiency,
  validateSpoolSpecifications,
  estimateProductionTime,
  createWorkOrder,
  getWorkOrders,
  getWorkOrder,
  updateWorkOrderStatus
} = workOrderService;

// Additional database functions for WorkOrder, Spool, and ProductionSpecification

// Get Work Orders directly from database
export async function fetchWorkOrders() {
  const { data, error } = await supabase
    .from('work_orders')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as WorkOrder[]
}

// Get Spools by Work Order ID
export async function fetchSpoolsByWorkOrderId(workOrderId: string) {
  const { data, error } = await supabase
    .from('spools')
    .select('*')
    .eq('workOrderId', workOrderId)
    .order('spoolNumber', { ascending: true })
  
  if (error) throw error
  return data as Spool[]
}

// Get Production Specification by Work Order ID
export async function fetchProductionSpecification(workOrderId: string) {
  const { data, error } = await supabase
    .from('production_specifications')
    .select('*')
    .eq('workOrderId', workOrderId)
    .single()
  
  if (error) throw error
  return data as ProductionSpecification
}

// Workers
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Employee[]
}

export async function addEmployees(Employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('employees')
    .insert([Employee])
    .select()
  
  if (error) throw error
  return data[0] as Employee
}

// Machines
export async function getMachines() {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Machine[]
}

export async function addMachine(machine: Omit<Machine, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('machines')
    .insert([machine])
    .select()
  
  if (error) throw error
  return data[0] as Machine
}

// Customers
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data
}

export async function addCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
  
  if (error) throw error
  return data[0] as Customer
}

// Orders
export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customer_id (name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as (Order & { customer: { name: string } })[]
}

export async function addOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
  
  if (error) throw error
  return data[0] as Order
}

// Production Logs
export async function getProductionLogs() {
  const { data, error } = await supabase
    .from('production_logs')
    .select(`
      *,
      employees (name),
      machines (name),
      orders (customer_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as ProductionLog[]
}

export async function addProductionLog(log: Omit<ProductionLog, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('production_logs')
    .insert([log])
    .select()
  
  if (error) throw error
  return data[0] as ProductionLog
}

export async function addEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
  
  if (error) throw error
  return data[0] as Employee
} 