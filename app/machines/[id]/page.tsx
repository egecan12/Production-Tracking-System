"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { Machine, WorkSession, Employee } from "../../types";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";
import { hasMachinePermission } from "../../lib/authUtils";

interface PageProps {
  params: {
    id: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export default function MachinePage({ params }: PageProps) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [activeOperators, setActiveOperators] = useState<
    (WorkSession & { employee: Employee })[]
  >([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [removeModal, setRemoveModal] = useState({
    isOpen: false,
    operatorId: "",
    operatorName: "",
  });
  const [removeLoading, setRemoveLoading] = useState(false);

  const canEdit = hasMachinePermission("edit");
  const canDelete = hasMachinePermission("delete");

  const machineId = params.id;

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch machine details
        const { data: machineData, error: machineError } = await supabase
          .from("machines")
          .select("*")
          .eq("id", machineId)
          .single();

        if (machineError) throw machineError;
        setMachine(machineData);

        // Fetch active operators for this machine
        const { data: operatorsData, error: operatorsError } = await supabase
          .from("work_sessions")
          .select(`*, employee:employee_id(*)`)
          .eq("machine_id", machineId)
          .eq("is_active", true);

        if (operatorsError) throw operatorsError;
        setActiveOperators(
          operatorsData as (WorkSession & { employee: Employee })[]
        );

        // Fetch all employees for dropdown
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("*");

        if (employeesError) throw employeesError;
        setEmployees(employeesData);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setMessage(`Hata: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [machineId]);

  const addOperator = async () => {
    if (!selectedEmployeeId) {
      setMessage("Lütfen bir işçi seçin");
      return;
    }

    // Makina pasif veya bakımdaysa operatör eklenemez
    if (machine?.status === "inactive" || machine?.status === "maintenance") {
      const statusText = machine.status === "inactive" ? "pasif" : "bakımda";
      setMessage(
        `Makina ${statusText} durumunda olduğu için operatör eklenemez`
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Check if this employee is already active on this machine
      const isEmployeeActive = activeOperators.some(
        (op) => op.employee_id === selectedEmployeeId
      );

      if (isEmployeeActive) {
        setMessage("Bu işçi zaten bu makinada çalışıyor");
        return;
      }

      // Add new operator record
      const { data, error } = await supabase
        .from("work_sessions")
        .insert([
          {
            employee_id: selectedEmployeeId,
            machine_id: machineId,
            start_time: new Date().toISOString(),
            is_active: true,
          },
        ])
        .select(`*, employee:employee_id(*)`);

      if (error) throw error;

      // Update active operators list
      setActiveOperators([
        ...activeOperators,
        ...(data as (WorkSession & { employee: Employee })[]),
      ]);
      setSelectedEmployeeId("");
      setMessage("Çalışan başarıyla eklendi");
    } catch (error: unknown) {
      console.error("Error adding operator:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveOperator = (operatorId: string, operatorName: string) => {
    setRemoveModal({
      isOpen: true,
      operatorId,
      operatorName,
    });
  };

  const cancelRemoveOperator = () => {
    setRemoveModal({
      isOpen: false,
      operatorId: "",
      operatorName: "",
    });
  };

  const removeOperator = async () => {
    if (!removeModal.operatorId) return;

    setRemoveLoading(true);
    setMessage("");

    try {
      // Update the operator record
      const { error } = await supabase
        .from("work_sessions")
        .update({
          end_time: new Date().toISOString(),
          is_active: false,
        })
        .eq("id", removeModal.operatorId);

      if (error) throw error;

      // Update the active operators list
      setActiveOperators(
        activeOperators.filter((op) => op.id !== removeModal.operatorId)
      );
      setMessage("Çalışan çıkışı başarıyla yapıldı");

      // Close modal
      setRemoveModal({
        isOpen: false,
        operatorId: "",
        operatorName: "",
      });
    } catch (error: unknown) {
      console.error("Error removing operator:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage(`Hata: ${errorMessage}`);
    } finally {
      setRemoveLoading(false);
    }
  };

  const updateMachineStatus = async (
    newStatus: "active" | "inactive" | "maintenance"
  ) => {
    if (!machine) return;

    // Makinada aktif çalışan varsa durum değiştirilemez
    if (activeOperators.length > 0) {
      setMessage(
        "Makinada aktif çalışanlar var. Önce çalışanların çıkışını yapmalısınız."
      );
      return;
    }

    setStatusLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("machines")
        .update({ status: newStatus })
        .eq("id", machineId);

      if (error) throw error;

      // Update local state
      setMachine({ ...machine, status: newStatus });
      setMessage(
        `Makina durumu "${
          newStatus === "active"
            ? "Aktif"
            : newStatus === "maintenance"
            ? "Bakımda"
            : "Pasif"
        }" olarak güncellendi`
      );
    } catch (error: unknown) {
      console.error("Error updating machine status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage(`Hata: ${errorMessage}`);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading && !machine) {
    return (
      <div className="text-center py-8 text-gray-300 bg-gray-900 min-h-screen">
        Yükleniyor...
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="text-center py-8 bg-gray-900 min-h-screen">
        <p className="text-red-400">Makina bulunamadı</p>
        <Link
          href="/machines"
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Makinelere Dön
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <Link
          href="/machines"
          className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-2 px-4 rounded inline-flex items-center"
        >
          <span>&#8592;</span>
          <span className="ml-2">Makinelere Dön</span>
        </Link>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-8 border border-gray-700">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-14 h-14 text-blue-500"
              >
                <rect x="5" y="50" width="54" height="4" rx="1" />
                <circle cx="20" cy="40" r="10" />
                <circle
                  cx="20"
                  cy="40"
                  r="3"
                  fill="currentColor"
                  opacity="0.2"
                />
                <line x1="20" y1="40" x2="48" y2="24" />
                <circle cx="48" cy="24" r="3" />
                <rect x="45" y="20" width="10" height="20" rx="1" />
                <circle cx="48" cy="24" r="1.5" fill="currentColor" />
                <circle cx="48" cy="28" r="1.5" fill="currentColor" />
                <circle cx="48" cy="32" r="1.5" fill="currentColor" />
                <circle cx="52" cy="24" r="1.5" fill="currentColor" />
                <circle cx="52" cy="28" r="1.5" fill="currentColor" />
                <circle cx="52" cy="32" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                {machine.name}
              </h1>
              <div className="flex items-center mt-1">
                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-sm mr-2">
                  No: {machine.number || "-"}
                </span>
                <p className="text-gray-300">
                  Konum: {machine.location || "Belirtilmemiş"}
                </p>
              </div>
              {machine.model && (
                <p className="text-gray-300 mt-1">Model: {machine.model}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                machine.status === "active"
                  ? "bg-green-900 text-green-300"
                  : machine.status === "maintenance"
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {machine.status === "active"
                ? "Aktif"
                : machine.status === "maintenance"
                ? "Bakımda"
                : "Pasif"}
            </div>
            {canEdit && (
              <div className="flex flex-col mt-3 space-y-2">
                <p className="text-sm text-gray-300 mb-1">Durum Değiştir:</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateMachineStatus("active")}
                    disabled={
                      machine.status === "active" ||
                      statusLoading ||
                      activeOperators.length > 0
                    }
                    className="px-2 py-1 text-xs font-medium rounded bg-green-700 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed relative group"
                    title={
                      activeOperators.length > 0
                        ? "Makinada aktif çalışanlar var"
                        : ""
                    }
                  >
                    Aktif
                    {activeOperators.length > 0 &&
                      machine.status !== "active" && (
                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Önce çalışanların çıkışını yapın
                        </span>
                      )}
                  </button>
                  <button
                    onClick={() => updateMachineStatus("maintenance")}
                    disabled={
                      machine.status === "maintenance" ||
                      statusLoading ||
                      activeOperators.length > 0
                    }
                    className="px-2 py-1 text-xs font-medium rounded bg-yellow-700 hover:bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed relative group"
                    title={
                      activeOperators.length > 0
                        ? "Makinada aktif çalışanlar var"
                        : ""
                    }
                  >
                    Bakımda
                    {activeOperators.length > 0 &&
                      machine.status !== "maintenance" && (
                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Önce çalışanların çıkışını yapın
                        </span>
                      )}
                  </button>
                  <button
                    onClick={() => updateMachineStatus("inactive")}
                    disabled={
                      machine.status === "inactive" ||
                      statusLoading ||
                      activeOperators.length > 0
                    }
                    className="px-2 py-1 text-xs font-medium rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed relative group"
                    title={
                      activeOperators.length > 0
                        ? "Makinada aktif çalışanlar var"
                        : ""
                    }
                  >
                    Pasif
                    {activeOperators.length > 0 &&
                      machine.status !== "inactive" && (
                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Önce çalışanların çıkışını yapın
                        </span>
                      )}
                  </button>
                </div>
              </div>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  /* Silme işlemi */
                }}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                Makineyi Sil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Operators Section */}
      <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-8 border border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Aktif Operatörler
        </h2>

        {activeOperators.length === 0 ? (
          <p className="text-gray-400">Bu makinada aktif operatör bulunmuyor</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800">
              <thead>
                <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID</th>
                  <th className="py-3 px-6 text-left">İsim</th>
                  <th className="py-3 px-6 text-left">Başlangıç Zamanı</th>
                  <th className="py-3 px-6 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm">
                {activeOperators.map((op) => (
                  <tr
                    key={op.id}
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    <td className="py-3 px-6 text-left">{op.employee.id}</td>
                    <td className="py-3 px-6 text-left">{op.employee.name}</td>
                    <td className="py-3 px-6 text-left">
                      {new Date(op.start_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button
                        onClick={() =>
                          confirmRemoveOperator(op.id, op.employee.name)
                        }
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded flex items-center mx-auto text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Çıkış Yap
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Operator Section */}
      <div className="bg-gray-800 shadow-md rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Operatör Ekle
        </h2>

        {machine.status !== "active" && (
          <div className="mb-4 p-3 bg-yellow-900/50 text-yellow-300 rounded-md border border-yellow-800">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Makina şu anda{" "}
              {machine.status === "inactive" ? "pasif" : "bakımda"} durumunda
              olduğu için operatör ataması yapılamaz.
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            disabled={machine?.status !== "active"}
            className="flex-grow md:w-2/3 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Çalışan Seçin</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.id} - {employee.name}
              </option>
            ))}
          </select>

          <button
            onClick={addOperator}
            disabled={
              loading || !selectedEmployeeId || machine?.status !== "active"
            }
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
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
                Ekleniyor...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Operatör Ekle
              </>
            )}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 text-sm rounded ${
              message.includes("aktif çalışanlar var")
                ? "bg-yellow-900/70 text-yellow-300 border border-yellow-800 flex items-start"
                : message.includes("Hata")
                ? "bg-red-900 text-red-300"
                : message === "Bu işçi zaten bu makinada çalışıyor"
                ? "bg-yellow-900 text-yellow-300"
                : "bg-green-900 text-green-300"
            }`}
          >
            {message.includes("aktif çalışanlar var") && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {message}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={removeModal.isOpen}
        title="Çalışan Çıkışı"
        message={`"${removeModal.operatorName}" isimli çalışanın çıkışını yapmak istediğinizden emin misiniz?`}
        confirmText="Evet, Çıkış Yap"
        cancelText="İptal"
        onConfirm={removeOperator}
        onCancel={cancelRemoveOperator}
        isLoading={removeLoading}
      />
    </main>
  );
}
