"use client";

import { useState, useEffect } from "react";
import { hasModuleAccess, getCurrentUserRole } from "../lib/authUtils";
import AccessDenied from "../components/AccessDenied";
import Link from "next/link";
import { getData, createData, deleteData, getActiveCustomers } from "../lib/dataService";
import ConfirmModal from "../components/ConfirmModal";

// Customer interface (aynı tipte olmalı)
interface Customer {
  id: string;
  name: string;
  company_name: string;
  contact_email: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

// Format telefon numarası fonksiyonu
const formatPhoneNumber = (phoneNumber: string): string => {
  // Sadece sayıları al
  const numbers = phoneNumber.replace(/\D/g, "");

  // Türk telefon formatı: 0(5XX) XXX XX XX
  if (numbers.length === 10) {
    return `0(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)} ${numbers.slice(
      6,
      8
    )} ${numbers.slice(8, 10)}`;
  } else if (numbers.length === 11 && numbers.startsWith("0")) {
    return `0(${numbers.slice(1, 4)}) ${numbers.slice(4, 7)} ${numbers.slice(
      7,
      9
    )} ${numbers.slice(9, 11)}`;
  }

  // Formatlanamıyorsa olduğu gibi döndür
  return phoneNumber;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    company_name: "",
    contact_email: "",
    phone_number: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    customerId: "",
    customerName: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    // Erişim kontrolü yap
    const userRole = getCurrentUserRole();
    const moduleAccess = hasModuleAccess("customers", userRole);
    setHasAccess(moduleAccess);

    // Erişim varsa verileri yükle
    if (moduleAccess) {
      fetchCustomers();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchCustomers() {
    try {
      console.log("Müşteriler yükleniyor...");
      const data = await getActiveCustomers<Customer>();
      console.log("Yüklenen müşteriler:", data);
      setCustomers(data || []);
    } catch (error: any) {
      console.error("Müşteri yükleme hatası:", error);
      setError("Müşteriler yüklenemedi: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsAddingCustomer(true);
      
      console.log("Yeni müşteri ekleniyor:", newCustomer);
      const addedCustomers = await createData<Customer>("customers", newCustomer);
      
      if (addedCustomers && addedCustomers.length > 0) {
        console.log("Müşteri eklendi:", addedCustomers[0]);
        setCustomers([...(addedCustomers || []), ...customers]);
        setNewCustomer({
          name: "",
          company_name: "",
          contact_email: "",
          phone_number: "",
        });
      }
    } catch (error: any) {
      console.error("Müşteri ekleme hatası:", error);
      setError("Müşteri eklenemedi: " + error.message);
    } finally {
      setIsAddingCustomer(false);
    }
  }

  function confirmDelete(id: string, name: string) {
    setDeleteModal({
      isOpen: true,
      customerId: id,
      customerName: name,
    });
  }

  function cancelDelete() {
    setDeleteModal({
      isOpen: false,
      customerId: "",
      customerName: "",
    });
  }

  async function handleDeleteCustomer() {
    if (!deleteModal.customerId) return;
    
    try {
      setDeleteLoading(true);
      
      console.log("Müşteri pasif duruma alınıyor:", deleteModal.customerId);
      await deleteData("customers", { id: deleteModal.customerId });
      
      console.log("Müşteri pasif duruma alındı");
      setCustomers(
        customers.filter((customer) => customer.id !== deleteModal.customerId)
      );
      
      setDeleteModal({ isOpen: false, customerId: "", customerName: "" });
    } catch (error: any) {
      console.error("Müşteri pasif duruma alma hatası:", error);
      setError("Müşteri pasif duruma alınamadı: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Erişim yoksa, erişim reddedildi sayfasını göster
  if (hasAccess === false) {
    return <AccessDenied />;
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">
            Müşteri Yönetimi
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
            <button
              onClick={() => setIsAddingCustomer(!isAddingCustomer)}
              className={`${
                isAddingCustomer
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-medium py-2 px-4 rounded`}
            >
              {isAddingCustomer ? "İptal" : "Yeni Müşteri Ekle"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isAddingCustomer && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Yeni Müşteri Ekle
            </h2>
            <form onSubmit={handleAddCustomer}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Müşteri Adı*
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="company_name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Şirket Adı
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    value={newCustomer.company_name}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        company_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact_email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    value={newCustomer.contact_email}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        contact_email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Telefon
                  </label>
                  <input
                    type="text"
                    id="phone_number"
                    value={newCustomer.phone_number}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        phone_number: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  Müşteri Ekle
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4 text-gray-300">Yükleniyor...</div>
        ) : customers.length === 0 ? (
          <p className="text-gray-400">Henüz kayıtlı müşteri bulunmuyor</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Müşteri Adı
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Şirket
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    E-posta
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Telefon
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-sm text-center text-gray-400"
                    >
                      Herhangi bir müşteri kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 uppercase">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 uppercase">
                        {customer.company_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {customer.contact_email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {customer.phone_number
                          ? formatPhoneNumber(customer.phone_number)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex gap-2">
                        <Link
                          href={`/customers/edit/${customer.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Düzenle
                        </Link>
                        <button
                          onClick={() =>
                            confirmDelete(customer.id!, customer.name)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="Müşteriyi Pasif Duruma Al"
          message={`"${deleteModal.customerName}" isimli müşteriyi pasif duruma almak istediğinizden emin misiniz? Bu işlem daha sonra geri alınabilir.`}
          confirmText="Evet, Pasif Duruma Al"
          cancelText="İptal"
          onConfirm={handleDeleteCustomer}
          onCancel={cancelDelete}
          isLoading={deleteLoading}
        />
      </div>
    </main>
  );
}
