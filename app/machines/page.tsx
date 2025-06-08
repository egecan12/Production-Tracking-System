"use client";

import { useState, useEffect } from "react";
import type { Machine } from "../types";
import Link from "next/link";
import { hasMachinePermission } from "../lib/authUtils";
import { getData, getActiveMachines } from "../lib/dataService";

type MachineWithOperatorCount = Machine & {
  operator_count: number;
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<MachineWithOperatorCount[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<MachineWithOperatorCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const canAddMachine = hasMachinePermission("add");

  useEffect(() => {
    async function fetchMachines() {
      try {
        console.log("Loading machines...");
        const machinesData = await getActiveMachines<Machine>();
        console.log("Loaded machine data:", machinesData);
        
        if (machinesData && machinesData.length > 0) {
          const machinesWithCounts = await Promise.all(
            machinesData.map(async (machine) => {
              const activeSessions = await getData<any>("work_sessions", { 
                machine_id: machine.id,
                is_active: true
              });
              
              return { 
                ...machine, 
                operator_count: activeSessions ? activeSessions.length : 0 
              };
            })
          );

          setMachines(machinesWithCounts);
          setFilteredMachines(machinesWithCounts);
        } else {
          setMachines([]);
          setFilteredMachines([]);
        }
      } catch (error) {
        console.error("Error fetching machines:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMachines();
  }, []);

  // Filter function
  useEffect(() => {
    let result = [...machines];
    
    // Text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(machine => 
        machine.name.toLowerCase().includes(searchLower) ||
        machine.number?.toString().toLowerCase().includes(searchLower) ||
        (machine.location && machine.location.toLowerCase().includes(searchLower))
      );
    }
    
    // Status filter
    if (statusFilter) {
      result = result.filter(machine => machine.status === statusFilter);
    }
    
    setFilteredMachines(result);
  }, [searchText, statusFilter, machines]);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === 'all' ? null : status);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      active: 'bg-green-500',
      maintenance: 'bg-yellow-500',
      inactive: 'bg-red-500'
    };
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-900 ${colors[status as keyof typeof colors] || 'bg-gray-500'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Machines</h1>
          <div className="flex space-x-3">
            {canAddMachine && (
              <Link
                href="/machines/add"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Machine
              </Link>
            )}
            <Link
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
          </div>
        </div>

        {/* Search Container */}
        <div className="flex items-center bg-gray-800 rounded-lg px-4 py-3 mb-4 border border-gray-700">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search machines..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center mb-6">
          <span className="text-gray-400 text-sm mr-3">Status:</span>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  (option.value === 'all' && !statusFilter) || statusFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
                style={{ cursor: 'pointer' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-gray-400 mb-4">
              {searchText || statusFilter ? 'No machines found matching your criteria' : 'No machines available yet'}
            </p>
            {canAddMachine && !searchText && !statusFilter && (
              <Link
                href="/machines/add"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Machine
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMachines.map((machine) => (
              <Link
                key={machine.id}
                href={`/machines/${machine.id}`}
                className="block"
                style={{ cursor: 'pointer' }}
              >
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{machine.name}</h3>
                        <p className="text-gray-400 text-sm">No: {machine.number}</p>
                      </div>
                    </div>
                    <StatusBadge status={machine.status} />
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {machine.location || "Not specified"}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className={machine.operator_count > 0 ? "text-blue-400 font-medium" : ""}>
                        {machine.operator_count} Operators
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
