"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getCustomers } from "../lib/database";

interface Customer {
  id: string;
  name: string;
  company_name: string;
}

export default function OrderForm() {
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerId: "",
    productType: "",
    thickness: "",
    width: "",
    diameter: "",
    length: "",
    weight: "",
    isolationType: "",
    deliveryWeek: "",
    productionStartDate: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Load customers
    async function loadCustomers() {
      try {
        const customersData = await getCustomers();
        setCustomers(customersData);
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    }

    loadCustomers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      orderNumber: "",
      customerId: "",
      productType: "",
      thickness: "",
      width: "",
      diameter: "",
      length: "",
      weight: "",
      isolationType: "",
      deliveryWeek: "",
      productionStartDate: "",
      quantity: "",
    });
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    const requiredFields = Object.entries(formData);
    const emptyFields = requiredFields.filter(([, value]) => value === "");

    if (emptyFields.length > 0) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Convert numerical values to numbers
      const numericalFormData = {
        order_number: formData.orderNumber,
        customer_id: formData.customerId,
        product_type: formData.productType,
        thickness: parseFloat(formData.thickness),
        width: parseFloat(formData.width),
        diameter: parseFloat(formData.diameter),
        length: parseFloat(formData.length),
        weight: parseFloat(formData.weight),
        isolation_type: formData.isolationType,
        delivery_week: parseInt(formData.deliveryWeek, 10),
        production_start_date: formData.productionStartDate,
        quantity: parseInt(formData.quantity, 10),
      };

      // Save to Supabase
      const { error } = await supabase
        .from("orders")
        .insert([numericalFormData])
        .select();

      if (error) throw error;

      setMessage("Order successfully saved!");
      handleReset();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order Number */}
          <div className="space-y-2">
            <label
              htmlFor="orderNumber"
              className="block text-sm font-medium text-gray-300"
            >
              Order Number
            </label>
            <input
              id="orderNumber"
              name="orderNumber"
              type="text"
              value={formData.orderNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="Enter order number"
            />
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <label
              htmlFor="customerId"
              className="block text-sm font-medium text-gray-300"
            >
              Customer
            </label>
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name
                    ? `${customer.name} (${customer.company_name})`
                    : customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-300"
            >
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="Enter quantity"
            />
          </div>

          {/* Product Type */}
          <div className="space-y-2">
            <label
              htmlFor="productType"
              className="block text-sm font-medium text-gray-300"
            >
              Product Type
            </label>
            <input
              id="productType"
              name="productType"
              type="text"
              value={formData.productType}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="Enter product type"
            />
          </div>

          {/* Thickness */}
          <div className="space-y-2">
            <label
              htmlFor="thickness"
              className="block text-sm font-medium text-gray-300"
            >
              Thickness
            </label>
            <input
              id="thickness"
              name="thickness"
              type="number"
              step="0.01"
              value={formData.thickness}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="0.00"
            />
          </div>

          {/* Width */}
          <div className="space-y-2">
            <label
              htmlFor="width"
              className="block text-sm font-medium text-gray-300"
            >
              Width
            </label>
            <input
              id="width"
              name="width"
              type="number"
              step="0.01"
              value={formData.width}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="0.00"
            />
          </div>

          {/* Diameter */}
          <div className="space-y-2">
            <label
              htmlFor="diameter"
              className="block text-sm font-medium text-gray-300"
            >
              Diameter
            </label>
            <input
              id="diameter"
              name="diameter"
              type="number"
              step="0.01"
              value={formData.diameter}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="0.00"
            />
          </div>

          {/* Length */}
          <div className="space-y-2">
            <label
              htmlFor="length"
              className="block text-sm font-medium text-gray-300"
            >
              Length
            </label>
            <input
              id="length"
              name="length"
              type="number"
              step="0.01"
              value={formData.length}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="0.00"
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-300"
            >
              Weight
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="0.00"
            />
          </div>

          {/* Isolation Type */}
          <div className="space-y-2">
            <label
              htmlFor="isolationType"
              className="block text-sm font-medium text-gray-300"
            >
              Isolation Type
            </label>
            <input
              id="isolationType"
              name="isolationType"
              type="text"
              value={formData.isolationType}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="Enter isolation type"
            />
          </div>

          {/* Delivery Week */}
          <div className="space-y-2">
            <label
              htmlFor="deliveryWeek"
              className="block text-sm font-medium text-gray-300"
            >
              Delivery Week
            </label>
            <input
              id="deliveryWeek"
              name="deliveryWeek"
              type="number"
              min="1"
              max="52"
              value={formData.deliveryWeek}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
              placeholder="1-52"
            />
          </div>

          {/* Production Start Date */}
          <div className="space-y-2">
            <label
              htmlFor="productionStartDate"
              className="block text-sm font-medium text-gray-300"
            >
              Production Start Date
            </label>
            <input
              id="productionStartDate"
              name="productionStartDate"
              type="date"
              value={formData.productionStartDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            style={{ cursor: "pointer" }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            style={{ cursor: "pointer" }}
          >
            {loading ? "Saving..." : "Save Order"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              message.includes("Error") 
                ? "bg-red-900/50 text-red-200 border border-red-700" 
                : "bg-green-900/50 text-green-200 border border-green-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </form>
  );
}
