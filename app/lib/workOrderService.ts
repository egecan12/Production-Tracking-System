import { supabase } from './supabase';
import type { Customer, WorkOrder, Spool, ProductionSpecification } from '../types';

class WorkOrderService {
    // Calculate Production Efficiency
    calculateProductionEfficiency(workOrder: WorkOrder, spools: Spool[]): number {
        const totalPlannedWeight = workOrder.totalOrderWeight;
        const actualTotalSpoolWeight = spools.reduce((sum, spool) => sum + spool.nakedWeight, 0);
        
        return (actualTotalSpoolWeight / totalPlannedWeight) * 100;
    }

    // Validate Spool Specifications
    validateSpoolSpecifications(
        workOrder: WorkOrder, 
        specs: ProductionSpecification, 
        spools: Spool[]
    ): { 
        isValid: boolean, 
        details: string[] 
    } {
        const validations = [];

        // Weight Tolerance Check
        const totalSpoolWeight = spools.reduce((sum, spool) => sum + spool.nakedWeight, 0);
        const weightTolerance = Math.abs(totalSpoolWeight - workOrder.totalOrderWeight) / workOrder.totalOrderWeight * 100;
        if (weightTolerance > 2) {
            validations.push(`Weight tolerance exceeded: ${weightTolerance.toFixed(2)}%`);
        }

        // Dimensional Checks
        spools.forEach(spool => {
            if (Math.abs(spool.length - (workOrder.totalOrderLength / spools.length)) > 
                (workOrder.totalOrderLength * 0.02)) {
                validations.push(`Spool ${spool.spoolNumber} length variation exceeds tolerance`);
            }
        });

        // Insulation Thickness Check
        const insulationThicknessVariation = spools.some(spool => 
            Math.abs(spool.insulationWeight || 0 - specs.insulationThickness) > 0.02
        );
        if (insulationThicknessVariation) {
            validations.push('Insulation thickness variations detected');
        }

        return {
            isValid: validations.length === 0,
            details: validations
        };
    }

    // Estimate Production Time
    estimateProductionTime(specs: ProductionSpecification, workOrder: WorkOrder): number {
        const totalLength = workOrder.totalOrderLength;
        const lineSpeed = specs.lineSpeed; // meters per minute
        
        return totalLength / lineSpeed; // in minutes
    }

    // Create Work Order with Comprehensive Validation
    async createWorkOrder(
        customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>, 
        workOrderData: Omit<WorkOrder, 'id' | 'customerId' | 'created_at' | 'updated_at'>, 
        spoolData: Omit<Spool, 'id' | 'workOrderId' | 'created_at' | 'updated_at'>[], 
        specData: Omit<ProductionSpecification, 'id' | 'workOrderId' | 'created_at' | 'updated_at'>
    ) {
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .insert(customerData)
            .select()
            .single();

        if (customerError) throw customerError;

        // Convert camelCase workOrderData to snake_case for database
        const snakeCaseWorkOrderData = {
            customer_id: customer.id,
            order_date: workOrderData.orderDate,
            delivery_date: workOrderData.deliveryDate,
            ref_no: workOrderData.refNo,
            total_order_weight: workOrderData.totalOrderWeight,
            total_order_length: workOrderData.totalOrderLength,
            product_type: workOrderData.productType,
            material_type: workOrderData.materialType,
            dimensions_width: workOrderData.dimensionsWidth,
            dimensions_thickness: workOrderData.dimensionsThickness,
            status: workOrderData.status
        };

        const { data: workOrder, error: workOrderError } = await supabase
            .from('work_orders')
            .insert(snakeCaseWorkOrderData)
            .select()
            .single();

        if (workOrderError) throw workOrderError;

        // Insert Spools with snake_case
        const snakeCaseSpoolsData = spoolData.map(spool => ({
            work_order_id: workOrder.id,
            spool_number: spool.spoolNumber,
            naked_weight: spool.nakedWeight,
            length: spool.length,
            diameter: spool.diameter,
            spool_type: spool.spoolType,
            insulation_weight: spool.insulationWeight
        }));

        const { error: spoolError } = await supabase
            .from('spools')
            .insert(snakeCaseSpoolsData);

        if (spoolError) throw spoolError;

        // Insert Production Specifications with snake_case
        const snakeCaseSpecData = {
            work_order_id: workOrder.id,
            paper_type: specData.paperType,
            insulation_thickness: specData.insulationThickness,
            production_speed: specData.productionSpeed,
            line_speed: specData.lineSpeed,
            paper_layers: specData.paperLayers,
            tolerance_thickness: specData.toleranceThickness,
            tolerance_width: specData.toleranceWidth
        };

        const { error: specError } = await supabase
            .from('production_specifications')
            .insert(snakeCaseSpecData);

        if (specError) throw specError;

        return { customer, workOrder, spools: snakeCaseSpoolsData, specs: snakeCaseSpecData };
    }

    // Get Work Orders with Related Data
    async getWorkOrders() {
        try {
            const { data, error } = await supabase
                .from('work_orders')
                .select(`
                    *,
                    customer:customer_id (name, company_name),
                    spools (*),
                    production_specs:production_specifications (*)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data;
        } catch (err) {
            console.error("Detailed error:", err);
            // Return empty array to prevent UI from breaking
            return [];
        }
    }

    // Get Single Work Order with Related Data
    async getWorkOrder(id: string) {
        const { data, error } = await supabase
            .from('work_orders')
            .select(`
                *,
                customer:customer_id (name, company_name),
                spools (*),
                production_specs:production_specifications (*)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }

    // Update Work Order Status
    async updateWorkOrderStatus(id: string, status: WorkOrder['status']) {
        const { data, error } = await supabase
            .from('work_orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
}

export default new WorkOrderService(); 