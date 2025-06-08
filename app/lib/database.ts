import { supabase } from './supabase'
import type { Employee, Machine, ProductionLog, Customer } from '../types'

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



// Production Logs
export async function getProductionLogs() {
  const { data, error } = await supabase
    .from('production_logs')
    .select(`
      *,
      employees (name),
      machines (name)
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