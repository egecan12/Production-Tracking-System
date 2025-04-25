"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import type { Employee } from "../../types";
import { createData } from "../../lib/dataService";

export default function CreateEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Employee form data
  const [employee, setEmployee] = useState<
    Omit<Employee, "id" | "created_at" | "updated_at">
  >({
    name: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validasyon
      if (!employee.name || !employee.email) {
        throw new Error("İsim ve email alanları zorunludur.");
      }

      // Yeni veri servisi ile çalışan ekle
      await createData('employees', {
        name: employee.name,
        email: employee.email,
        phone: employee.phone || null,
      });

      setSuccess("Çalışan başarıyla eklendi!");
      setEmployee({
        name: "",
        email: "",
        phone: "",
      });

      // 2 saniye sonra çalışanlar sayfasına yönlendir
      setTimeout(() => {
        router.push("/employees");
      }, 2000);
    } catch (err: unknown) {
      console.error("Çalışan ekleme hatası:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Çalışan eklenirken bir hata oluştu. Lütfen tekrar deneyin.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">
            Yeni Çalışan Ekle
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
              Ana Sayfa
            </Link>
            <Link
              href="/employees"
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded"
            >
              Çalışanlar Listesine Dön
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900 border border-green-600 text-green-300 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                İsim *
              </label>
              <input
                type="text"
                name="name"
                value={employee.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Çalışanın adını giriniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                E-posta Adresi *
              </label>
              <input
                type="email"
                name="email"
                value={employee.email}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ornek@sirket.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Telefon Numarası
              </label>
              <input
                type="text"
                name="phone"
                value={employee.phone || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="İsteğe bağlı"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Ekleniyor..." : "Çalışan Ekle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
