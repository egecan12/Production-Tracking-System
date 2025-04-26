"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getData } from "../lib/dataService";

interface Customer {
  id: string;
  name: string;
  company_name: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  product_type: string;
  thickness: number;
  width: number;
  diameter: number;
  length: number;
  weight: number;
  isolation_type: string;
  delivery_week: number;
  production_start_date: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        console.log("Loading orders with dataService...");
        
        // Get orders using dataService
        const data = await getData<Order>("orders");
        console.log("Order data:", data);
        
        setOrders(data || []);
        setError("");
      } catch (err: any) {
        console.error("Error loading orders:", err);
        setError(err.message || "An error occurred while loading orders.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-800 text-yellow-100";
      case "in_progress":
        return "bg-blue-800 text-blue-100";
      case "completed":
        return "bg-green-800 text-green-100";
      case "cancelled":
        return "bg-red-800 text-red-100";
      default:
        return "bg-gray-800 text-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Production";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 text-red-100 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-md text-center border border-gray-700">
        <p className="text-gray-400">
          No orders have been saved yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">
              Order Number
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">
              Customer
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">
              Product Type
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">
              Dimensions
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">
              Weight
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">
              Delivery Week
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">
              Production Start
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-t border-gray-700 hover:bg-gray-750"
            >
              <td className="py-3 px-4 text-gray-300">{order.order_number}</td>
              <td className="py-3 px-4 text-gray-300">
                {order.customer?.company_name
                  ? `${order.customer.name} (${order.customer.company_name})`
                  : order.customer?.name}
              </td>
              <td className="py-3 px-4 text-gray-300">{order.product_type}</td>
              <td className="py-3 px-4 text-gray-300">
                {order.thickness} x {order.width} x {order.diameter}
              </td>
              <td className="py-3 px-4 text-gray-300">{order.weight} kg</td>
              <td className="py-3 px-4 text-gray-300">
                Week {order.delivery_week}
              </td>
              <td className="py-3 px-4 text-gray-300">
                {formatDate(order.production_start_date)}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
