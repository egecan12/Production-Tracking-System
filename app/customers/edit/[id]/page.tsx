"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import type { Customer } from "../../../types";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Customer form data
  const [customer, setCustomer] = useState<Customer>({
    id: customerId as string,
    name: "",
    company_name: "",
    contact_email: "",
    phone_number: "",
    is_active: true,
  });

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error("Müşteri bulunamadı");
        }

        const customerData = data[0];
        setCustomer({
          id: customerData.id,
          name: customerData.name,
          company_name: customerData.company_name || "",
          contact_email: customerData.contact_email || "",
          phone_number: customerData.phone_number || "",
          is_active: customerData.is_active === undefined ? true : customerData.is_active,
        });
      } catch (err: unknown) {
        console.error("Müşteri verisi alınırken hata:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Müşteri bilgileri yüklenirken bir hata oluştu.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomer();
  }, [customerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validasyon
      if (!customer.name) {
        throw new Error("Müşteri adı zorunludur.");
      }

      // Müşteri bilgilerini güncelle
      const { error: supabaseError } = await supabase
        .from("customers")
        .update({
          name: customer.name,
          company_name: customer.company_name || null,
          contact_email: customer.contact_email || null,
          phone_number: customer.phone_number || null,
        })
        .eq("id", customerId);

      if (supabaseError) throw supabaseError;

      setSuccess("Müşteri bilgileri başarıyla güncellendi!");

      // 2 saniye sonra müşteriler sayfasına yönlendir
      setTimeout(() => {
        router.push("/customers");
      }, 2000);
    } catch (err: unknown) {
      console.error("Müşteri güncelleme hatası:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Müşteri güncellenirken bir hata oluştu. Lütfen tekrar deneyin.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">
              Müşteri Düzenle
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
                href="/customers"
                className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded"
              >
                Müşteri Listesine Dön
              </Link>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-300">
              Müşteri bilgileri yükleniyor...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">
            Müşteri Düzenle
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
              href="/customers"
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded"
            >
              Müşteri Listesine Dön
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
                Müşteri Adı *
              </label>
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Müşterinin adını giriniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Şirket Adı
              </label>
              <input
                type="text"
                name="company_name"
                value={customer.company_name}
                onChange={handleInputChange}
                className="w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Şirket adını giriniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                E-posta Adresi
              </label>
              <input
                type="email"
                name="contact_email"
                value={customer.contact_email}
                onChange={handleInputChange}
                className="w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="iletisim@sirket.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Telefon Numarası
              </label>
              <input
                type="text"
                name="phone_number"
                value={customer.phone_number}
                onChange={handleInputChange}
                className="w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="İsteğe bağlı"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="is_active" className="block mb-1 font-medium text-gray-300">
                Durum
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={customer.is_active}
                  onChange={(e) => setCustomer({ ...customer, is_active: e.target.checked })}
                  className="w-5 h-5 mr-2 rounded accent-blue-500 cursor-pointer"
                />
                <span className="text-gray-300">
                  {customer.is_active ? "Aktif" : "Pasif"}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Pasif müşteriler listede görünmez ve yeni sipariş oluşturma işlemlerinde kullanılamaz.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/customers"
                className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 w-1/2 text-center"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Güncelleniyor...
                  </>
                ) : (
                  "Güncelle"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
