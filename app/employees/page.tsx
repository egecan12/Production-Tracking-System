"use client";

import { useState, useEffect } from "react";
import type { Employee } from "../types";
import Link from "next/link";
import ConfirmModal from "../components/ConfirmModal";
import { getData, deleteData } from "../lib/dataService";

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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employeeId: "",
    employeeName: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      console.log("Çalışanlar yükleniyor...");
      const data = await getData<Employee>("employees");
      console.log("Çalışan verileri:", data);
      setEmployees(data || []);
    } catch (error: any) {
      console.error("Çalışan yükleme hatası:", error);
      setError("Çalışanlar yüklenemedi: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(id: string, name: string) {
    setDeleteModal({
      isOpen: true,
      employeeId: id,
      employeeName: name,
    });
  }

  function cancelDelete() {
    setDeleteModal({
      isOpen: false,
      employeeId: "",
      employeeName: "",
    });
  }

  async function handleDelete() {
    if (!deleteModal.employeeId) return;

    setDeleteLoading(true);
    try {
      console.log("Çalışan siliniyor:", deleteModal.employeeId);
      await deleteData("employees", { id: deleteModal.employeeId });
      console.log("Çalışan silindi");

      // Update employees list
      setEmployees(
        employees.filter((employee) => employee.id !== deleteModal.employeeId)
      );

      // Close modal
      setDeleteModal({
        isOpen: false,
        employeeId: "",
        employeeName: "",
      });
    } catch (error: any) {
      console.error("Çalışan silme hatası:", error);
      setError("Çalışan silinemedi: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Çalışan Yönetimi</h1>
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
            href="/employees/create"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Yeni Çalışan Ekle
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-gray-300">Yükleniyor...</div>
      ) : employees.length === 0 ? (
        <p className="text-gray-400">Henüz kayıtlı işçi bulunmuyor</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800">
            <thead>
              <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">İsim</th>
                <th className="py-3 px-6 text-left">E-posta</th>
                <th className="py-3 px-6 text-left">Telefon</th>
                <th className="py-3 px-6 text-left">İşlemler</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 text-sm">
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="py-3 px-6 text-left">{employee.id}</td>
                  <td className="py-3 px-6 text-left uppercase">
                    {employee.name}
                  </td>
                  <td className="py-3 px-6 text-left">{employee.email}</td>
                  <td className="py-3 px-6 text-left">
                    {employee.phone ? formatPhoneNumber(employee.phone) : "-"}
                  </td>
                  <td className="py-3 px-6 text-left flex space-x-3">
                    <Link
                      href={`/employees/edit/${employee.id}`}
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
                      onClick={() => confirmDelete(employee.id, employee.name)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Çalışan Silme"
        message={`"${deleteModal.employeeName}" isimli çalışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={handleDelete}
        onCancel={cancelDelete}
        isLoading={deleteLoading}
      />
    </main>
  );
}
