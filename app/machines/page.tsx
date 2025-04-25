"use client";

import { useState, useEffect } from "react";
import type { Machine } from "../types";
import Link from "next/link";
import { hasMachinePermission } from "../lib/authUtils";
import { getData } from "../lib/dataService";

type MachineWithOperatorCount = Machine & {
  operator_count: number;
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<MachineWithOperatorCount[]>([]);
  const [loading, setLoading] = useState(true);
  const canAddMachine = hasMachinePermission("add");

  useEffect(() => {
    async function fetchMachines() {
      try {
        console.log("Makineler yükleniyor...");
        // dataService'i kullan
        const machinesData = await getData<Machine>("machines");
        console.log("Yüklenen makine verileri:", machinesData);
        
        if (machinesData) {
          // Şimdilik operatör sayısını sıfır olarak ayarlayalım
          // İlerde work_sessions API'ye eklenebilir
          const machinesWithCounts = machinesData.map(machine => {
            return { ...machine, operator_count: 0 };
          });

          setMachines(machinesWithCounts);
        }
      } catch (error) {
        console.error("Makineleri getirme hatası:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMachines();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Makinalar</h1>
        <div className="flex space-x-3">
          {canAddMachine && (
            <Link
              href="/machines/add"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Makine Ekle
            </Link>
          )}
          <Link
            href="/"
            className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-300">Yükleniyor...</div>
      ) : machines.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">Henüz makine bulunmuyor</p>
          {canAddMachine && (
            <Link
              href="/machines/add"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Makine Ekle
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <Link
              key={machine.id}
              href={`/machines/${machine.id}`}
              className="block"
            >
              <div className="bg-gray-800 shadow-md rounded-lg p-6 hover:bg-gray-700 transition-colors border border-gray-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-12 h-12 text-blue-500"
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
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-gray-100">
                        {machine.name}
                      </h2>
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-sm">
                        No: {machine.number}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2">
                      Konum: {machine.location || "Belirtilmemiş"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            machine.status === "active"
                              ? "bg-green-500"
                              : machine.status === "maintenance"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                        <span className="text-sm capitalize text-gray-300">
                          {machine.status === "active"
                            ? "Aktif"
                            : machine.status === "maintenance"
                            ? "Bakımda"
                            : "Pasif"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span
                          className={`${
                            machine.operator_count > 0
                              ? "text-blue-400 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {machine.operator_count} Operatör
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
