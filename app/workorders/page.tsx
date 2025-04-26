"use client";

import { useState, useEffect } from "react";
import { getWorkOrders, updateWorkOrderStatus } from "../lib/database";
import type { WorkOrder } from "../types";
import Link from "next/link";

type WorkOrderWithRelations = WorkOrder & {
  customer?: {
    name: string;
    companyName?: string;
    company_name?: string;
  };
  // Snake case fields from API
  ref_no?: string;
  product_type?: string;
  order_date?: string | Date;
  material_type?: string;
  total_order_weight?: number;
  total_order_length?: number;
  dimensions_width?: number;
  dimensions_thickness?: number;
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkOrders() {
      try {
        const data = await getWorkOrders();
        setWorkOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading work orders:", err);
        setError("Failed to load work orders. Please try again later.");
        setLoading(false);
      }
    }

    loadWorkOrders();
  }, []);

  const handleStatusChange = async (
    workOrderId: string,
    status: WorkOrder["status"]
  ) => {
    try {
      await updateWorkOrderStatus(workOrderId, status);
      // Refresh the work orders list
      const data = await getWorkOrders();
      setWorkOrders(data);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  if (loading) return <div className="p-6">Loading work orders...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-100">
              Work Orders
            </h1>
            <div className="flex space-x-2">
              <Link
                href="/"
                className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home Page
              </Link>
              <Link
                href="/workorders/create"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Create New Work Order
              </Link>
            </div>
          </div>

          <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Reference No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {workOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      No work orders found
                    </td>
                  </tr>
                ) : (
                  workOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {order.refNo || order.ref_no || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 uppercase">
                        {order.customer?.companyName ||
                          order.customer?.company_name ||
                          order.customer?.name ||
                          "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 uppercase">
                        {order.productType || order.product_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(
                          order.orderDate || order.order_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "COMPLETED"
                              ? "bg-green-900 text-green-300"
                              : order.status === "IN_PROGRESS"
                              ? "bg-blue-900 text-blue-300"
                              : order.status === "PENDING"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/workorders/${order.id}`}
                          className="text-blue-400 hover:text-blue-300 mr-4"
                        >
                          View
                        </Link>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id!,
                              e.target.value as WorkOrder["status"]
                            )
                          }
                          className="bg-gray-700 border border-gray-600 text-gray-300 rounded px-2 py-1"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
