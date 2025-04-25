"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getWorkOrder,
  updateWorkOrderStatus,
  calculateProductionEfficiency,
  validateSpoolSpecifications,
  estimateProductionTime,
} from "../../lib/database";
import type { WorkOrder, Spool, ProductionSpecification } from "../../types";
import Link from "next/link";

type WorkOrderDetail = WorkOrder & {
  customer: {
    name: string;
    companyName?: string;
    company_name?: string;
  };
  spools: Spool[];
  production_specs: ProductionSpecification;
  // Snake case fields
  ref_no?: string;
  product_type?: string;
  order_date?: string | Date;
  delivery_date?: string | Date;
  material_type?: string;
  total_order_weight?: number;
  total_order_length?: number;
  dimensions_width?: number;
  dimensions_thickness?: number;
};

export default function WorkOrderDetailPage() {
  const params = useParams();
  const workOrderId = params.id as string;

  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculated metrics
  const [efficiency, setEfficiency] = useState<number | null>(null);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    details: string[];
  } | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  useEffect(() => {
    async function loadWorkOrderDetails() {
      try {
        const data = await getWorkOrder(workOrderId);
        setWorkOrder(data);

        // Calculate metrics
        if (data.spools?.length > 0 && data.production_specs) {
          setEfficiency(calculateProductionEfficiency(data, data.spools));
          setValidation(
            validateSpoolSpecifications(
              data,
              data.production_specs,
              data.spools
            )
          );
          setEstimatedTime(estimateProductionTime(data.production_specs, data));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading work order:", err);
        setError("Failed to load work order details. Please try again later.");
        setLoading(false);
      }
    }

    loadWorkOrderDetails();
  }, [workOrderId]);

  const handleStatusChange = async (status: WorkOrder["status"]) => {
    try {
      await updateWorkOrderStatus(workOrderId, status);
      // Refresh the work order
      const data = await getWorkOrder(workOrderId);
      setWorkOrder(data);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-gray-300">
        İş emri detayları yükleniyor...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-red-400">{error}</div>
    );
  if (!workOrder)
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-gray-300">
        İş emri bulunamadı
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-100">
              İş Emri{" "}
              {workOrder.ref_no
                ? `#${workOrder.ref_no}`
                : workOrderId.slice(0, 8)}
            </h1>
            <div className="flex space-x-2">
              <Link
                href="/workorders"
                className="bg-gray-700 text-gray-300 py-2 px-4 rounded hover:bg-gray-600"
              >
                İş Emirlerine Dön
              </Link>
              <select
                value={workOrder.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as WorkOrder["status"])
                }
                className="bg-gray-700 border border-gray-600 text-gray-300 rounded px-4 py-2"
              >
                <option value="PENDING">Beklemede</option>
                <option value="IN_PROGRESS">Devam Ediyor</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                workOrder.status === "COMPLETED"
                  ? "bg-green-900 text-green-300"
                  : workOrder.status === "IN_PROGRESS"
                  ? "bg-blue-900 text-blue-300"
                  : workOrder.status === "PENDING"
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {workOrder.status.replace("_", " ")}
            </span>
          </div>

          {/* Customer & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                Müşteri Bilgileri
              </h2>
              <dl className="space-y-2">
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {workOrder.customer?.name}
                  </dd>
                </div>
                {workOrder.customer?.companyName && (
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Company
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {workOrder.customer.companyName}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                Sipariş Bilgileri
              </h2>
              <dl className="space-y-2">
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Order Date
                  </dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {workOrder.order_date &&
                      new Date(workOrder.order_date).toLocaleDateString()}
                  </dd>
                </div>
                {workOrder.delivery_date && (
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Delivery Date
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {new Date(workOrder.delivery_date).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Reference No
                  </dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {workOrder.ref_no || "-"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Work Order Details */}
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Sipariş Özellikleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <dl className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Product Type
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {workOrder.product_type}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Material Type
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {workOrder.material_type}
                  </dd>
                </div>
              </dl>
              <dl className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Weight
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {workOrder.total_order_weight} kg
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Length
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {workOrder.total_order_length} m
                  </dd>
                </div>
              </dl>
              <dl className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Width</dt>
                  <dd className="text-sm text-gray-900">
                    {workOrder.dimensions_width} mm
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Thickness
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {workOrder.dimensions_thickness} mm
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Production Metrics */}
          {efficiency !== null &&
            validation !== null &&
            estimatedTime !== null && (
              <div className="bg-gray-800 p-6 rounded-lg shadow mb-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">
                  Üretim Metrikleri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-700 rounded border border-gray-600">
                    <h3 className="text-base font-medium text-gray-300 mb-2">
                      Üretim Verimliliği
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        efficiency >= 95
                          ? "text-green-400"
                          : efficiency >= 85
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {efficiency.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded border border-gray-600">
                    <h3 className="text-base font-medium text-gray-300 mb-2">
                      Specifications Status
                    </h3>
                    <p
                      className={`text-lg font-semibold ${
                        validation.isValid ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {validation.isValid ? "Valid" : "Issues Detected"}
                    </p>
                    {!validation.isValid && validation.details.length > 0 && (
                      <ul className="mt-2 text-sm text-red-400 list-disc list-inside">
                        {validation.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="p-4 bg-gray-700 rounded border border-gray-600">
                    <h3 className="text-base font-medium text-gray-300 mb-2">
                      Estimated Production Time
                    </h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {Math.floor(estimatedTime / 60)} h{" "}
                      {Math.round(estimatedTime % 60)} min
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Spools */}
          {workOrder.spools && workOrder.spools.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg shadow mb-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                Makaralar
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Spool #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Weight (kg)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Length (m)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Diameter (mm)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Insulation Weight
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {workOrder.spools.map((spool) => (
                      <tr key={spool.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {spool.spoolNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {spool.nakedWeight}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {spool.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {spool.diameter}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {spool.spoolType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {spool.insulationWeight || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Production Specifications */}
          {workOrder.production_specs && (
            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                Üretim Özellikleri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <dl className="space-y-2">
                  {workOrder.production_specs.paperType && (
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Paper Type
                      </dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {workOrder.production_specs.paperType}
                      </dd>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Insulation Thickness
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {workOrder.production_specs.insulationThickness} mm
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Production Speed
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {workOrder.production_specs.productionSpeed} m/min
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Line Speed
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {workOrder.production_specs.lineSpeed} m/min
                    </dd>
                  </div>
                </dl>
                <dl className="space-y-2">
                  {workOrder.production_specs.paperLayers !== undefined && (
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Paper Layers
                      </dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {workOrder.production_specs.paperLayers}
                      </dd>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Tolerance Thickness
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {workOrder.production_specs.toleranceThickness} mm
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Tolerance Width
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {workOrder.production_specs.toleranceWidth} mm
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
