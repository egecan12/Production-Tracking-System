"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkOrder } from "../../lib/database";
import type {
  Customer,
  WorkOrder,
  Spool,
  ProductionSpecification,
} from "../../types";

export default function CreateWorkOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer form data
  const [customer, setCustomer] = useState<
    Omit<Customer, "id" | "created_at" | "updated_at">
  >({
    name: "",
    companyName: "",
    contactEmail: "",
    phoneNumber: "",
  });

  // Work order form data
  const [workOrder, setWorkOrder] = useState<
    Omit<WorkOrder, "id" | "customerId" | "created_at" | "updated_at">
  >({
    orderDate: new Date(),
    totalOrderWeight: 0,
    totalOrderLength: 0,
    productType: "",
    materialType: "",
    dimensionsWidth: 0,
    dimensionsThickness: 0,
    status: "PENDING",
  });

  // Spool form data (we'll create one spool as an example)
  const [spool, setSpool] = useState<
    Omit<Spool, "id" | "workOrderId" | "created_at" | "updated_at">
  >({
    spoolNumber: 1,
    nakedWeight: 0,
    length: 0,
    diameter: 0,
    spoolType: "",
  });

  // Production specification form data
  const [spec, setSpec] = useState<
    Omit<
      ProductionSpecification,
      "id" | "workOrderId" | "created_at" | "updated_at"
    >
  >({
    insulationThickness: 0,
    productionSpeed: 0,
    lineSpeed: 0,
    toleranceThickness: 0,
    toleranceWidth: 0,
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkOrderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setWorkOrder((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSpoolChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSpool((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSpecChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSpec((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert to match API expectations
      const customerData = {
        name: customer.name,
        company_name: customer.companyName,
        contact_email: customer.contactEmail,
        phone_number: customer.phoneNumber,
      };

      const workOrderData = {
        orderDate: workOrder.orderDate,
        deliveryDate: workOrder.deliveryDate,
        refNo: workOrder.refNo,
        totalOrderWeight: workOrder.totalOrderWeight,
        totalOrderLength: workOrder.totalOrderLength,
        productType: workOrder.productType,
        materialType: workOrder.materialType,
        dimensionsWidth: workOrder.dimensionsWidth,
        dimensionsThickness: workOrder.dimensionsThickness,
        status: workOrder.status,
      };

      const spoolData = [
        {
          spoolNumber: spool.spoolNumber,
          nakedWeight: spool.nakedWeight,
          length: spool.length,
          diameter: spool.diameter,
          spoolType: spool.spoolType,
          insulationWeight: spool.insulationWeight,
        },
      ];

      const specData = {
        paperType: spec.paperType,
        insulationThickness: spec.insulationThickness,
        productionSpeed: spec.productionSpeed,
        lineSpeed: spec.lineSpeed,
        paperLayers: spec.paperLayers,
        toleranceThickness: spec.toleranceThickness,
        toleranceWidth: spec.toleranceWidth,
      };

      await createWorkOrder(
        customerData as any,
        workOrderData as any,
        spoolData as any,
        specData as any
      );
      router.push("/workorders");
    } catch (err) {
      console.error("Error creating work order:", err);
      setError("Failed to create work order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-100 mb-6">
          Yeni İş Emri Oluştur
        </h1>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Müşteri Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  İsim *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleCustomerChange}
                  required
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Şirket Adı
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={customer.companyName || ""}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={customer.contactEmail || ""}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={customer.phoneNumber || ""}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Work Order Details */}
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Sipariş Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Referans Numarası
                </label>
                <input
                  type="text"
                  name="refNo"
                  value={workOrder.refNo || ""}
                  onChange={handleWorkOrderChange}
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Ürün Tipi *
                </label>
                <input
                  type="text"
                  name="productType"
                  value={workOrder.productType}
                  onChange={handleWorkOrderChange}
                  required
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Malzeme Tipi *
                </label>
                <input
                  type="text"
                  name="materialType"
                  value={workOrder.materialType}
                  onChange={handleWorkOrderChange}
                  required
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Toplam Sipariş Ağırlığı (kg) *
                </label>
                <input
                  type="number"
                  name="totalOrderWeight"
                  value={workOrder.totalOrderWeight}
                  onChange={handleWorkOrderChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Toplam Sipariş Uzunluğu (m) *
                </label>
                <input
                  type="number"
                  name="totalOrderLength"
                  value={workOrder.totalOrderLength}
                  onChange={handleWorkOrderChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Genişlik (mm) *
                </label>
                <input
                  type="number"
                  name="dimensionsWidth"
                  value={workOrder.dimensionsWidth}
                  onChange={handleWorkOrderChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Kalınlık (mm) *
                </label>
                <input
                  type="number"
                  name="dimensionsThickness"
                  value={workOrder.dimensionsThickness}
                  onChange={handleWorkOrderChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Spool Details */}
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Makaralar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Makaralar Numarası *
                </label>
                <input
                  type="number"
                  name="spoolNumber"
                  value={spool.spoolNumber}
                  onChange={handleSpoolChange}
                  required
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Ham Ağırlık (kg) *
                </label>
                <input
                  type="number"
                  name="nakedWeight"
                  value={spool.nakedWeight}
                  onChange={handleSpoolChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Uzunluk (m) *
                </label>
                <input
                  type="number"
                  name="length"
                  value={spool.length}
                  onChange={handleSpoolChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Çap (mm) *
                </label>
                <input
                  type="number"
                  name="diameter"
                  value={spool.diameter}
                  onChange={handleSpoolChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Makaralar Tipi *
                </label>
                <input
                  type="text"
                  name="spoolType"
                  value={spool.spoolType}
                  onChange={handleSpoolChange}
                  required
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Yalıtım Ağırlığı (kg)
                </label>
                <input
                  type="number"
                  name="insulationWeight"
                  value={spool.insulationWeight || 0}
                  onChange={handleSpoolChange}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Production Specifications */}
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Üretim Özellikleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Kağıt Tipi
                </label>
                <input
                  type="text"
                  name="paperType"
                  value={spec.paperType || ""}
                  onChange={handleSpecChange}
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Yalıtım Kalınlığı (mm) *
                </label>
                <input
                  type="number"
                  name="insulationThickness"
                  value={spec.insulationThickness}
                  onChange={handleSpecChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Üretim Hızı (m/dk) *
                </label>
                <input
                  type="number"
                  name="productionSpeed"
                  value={spec.productionSpeed}
                  onChange={handleSpecChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Hat Hızı (m/dk) *
                </label>
                <input
                  type="number"
                  name="lineSpeed"
                  value={spec.lineSpeed}
                  onChange={handleSpecChange}
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Kağıt Katmanları
                </label>
                <input
                  type="number"
                  name="paperLayers"
                  value={spec.paperLayers || 0}
                  onChange={handleSpecChange}
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Tolerans Kalınlığı (mm) *
                </label>
                <input
                  type="number"
                  name="toleranceThickness"
                  value={spec.toleranceThickness}
                  onChange={handleSpecChange}
                  required
                  step="0.001"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Tolerans Genişliği (mm) *
                </label>
                <input
                  type="number"
                  name="toleranceWidth"
                  value={spec.toleranceWidth}
                  onChange={handleSpecChange}
                  required
                  step="0.001"
                  min="0"
                  className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70"
            >
              {isSubmitting ? "Oluşturuluyor..." : "İş Emri Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
