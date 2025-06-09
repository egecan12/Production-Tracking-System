"use client";

import { useState, useEffect } from "react";
import type { Employee } from "../types";
import Link from "next/link";
import ConfirmModal from "../components/ConfirmModal";
import { getData, deleteData } from "../lib/dataService";

// Format phone number function
const formatPhoneNumber = (phoneNumber: string): string => {
  const numbers = phoneNumber.replace(/\D/g, "");
  
  if (numbers.length === 10) {
    return `+90 ${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
  } else if (numbers.length === 11 && numbers.startsWith("0")) {
    return `+90 ${numbers.slice(1, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
  }
  
  return phoneNumber;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employeeId: "",
    employeeName: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Performance measurement for thesis
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pageLoadStart: 0,
    dataFetchStart: 0,
    dataFetchEnd: 0,
    renderComplete: 0,
    totalLoadTime: 0
  });

  useEffect(() => {
    // Mark page load start for thesis research
    const pageLoadStart = performance.now();
    setPerformanceMetrics(prev => ({ ...prev, pageLoadStart }));
    
    fetchEmployees();
  }, []);

  // Mark render complete after employees are loaded
  useEffect(() => {
    if (!loading && employees.length > 0) {
      const renderComplete = performance.now();
      setPerformanceMetrics(prev => {
        const totalLoadTime = renderComplete - prev.pageLoadStart;
        const updated = { ...prev, renderComplete, totalLoadTime };
        
        // Log performance metrics for thesis research
        console.log('📊 EMPLOYEES PAGE PERFORMANCE METRICS (WEB):', {
          pageLoadStart: `${prev.pageLoadStart.toFixed(2)}ms`,
          dataFetchTime: `${(prev.dataFetchEnd - prev.dataFetchStart).toFixed(2)}ms`,
          totalLoadTime: `${totalLoadTime.toFixed(2)}ms`,
          employeesCount: employees.length,
          timestamp: new Date().toISOString()
        });
        
        return updated;
      });
    }
  }, [loading, employees]);

  // Filter function
  useEffect(() => {
    let result = [...employees];
    
    // Text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(employee => 
        employee.name.toLowerCase().includes(searchLower) ||
        (employee.email && employee.email.toLowerCase().includes(searchLower)) ||
        (employee.position && employee.position.toLowerCase().includes(searchLower)) ||
        (employee.department && employee.department.toLowerCase().includes(searchLower))
      );
    }
    
    // Department filter
    if (departmentFilter) {
      result = result.filter(employee => employee.department === departmentFilter);
    }
    
    setFilteredEmployees(result);
  }, [searchText, departmentFilter, employees]);

  async function fetchEmployees() {
    try {
      // Mark data fetch start for thesis research
      const dataFetchStart = performance.now();
      setPerformanceMetrics(prev => ({ ...prev, dataFetchStart }));
      
      console.log("Loading employees...");
      const data = await getData<Employee>("employees", { is_active: true });
      console.log("Employee data:", data);
      
      // Mark data fetch end for thesis research
      const dataFetchEnd = performance.now();
      setPerformanceMetrics(prev => ({ ...prev, dataFetchEnd }));
      
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error: any) {
      console.error("Employee loading error:", error);
      setError("Failed to load employees: " + error.message);
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
      console.log("Setting employee to inactive:", deleteModal.employeeId);
      await deleteData("employees", { id: deleteModal.employeeId });
      console.log("Employee set to inactive");

      setEmployees(
        employees.filter((employee) => employee.id !== deleteModal.employeeId)
      );

      setDeleteModal({
        isOpen: false,
        employeeId: "",
        employeeName: "",
      });
    } catch (error: any) {
      console.error("Error setting employee to inactive:", error);
      setError("Failed to set employee to inactive: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Get unique departments for filter
  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));
  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    ...departments.map(dept => ({ value: dept!, label: dept! }))
  ];

  const handleDepartmentFilter = (department: string) => {
    setDepartmentFilter(department === 'all' ? null : department);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Employee Management</h1>
          <div className="flex space-x-3">
            <Link
              href="/employees/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Employee
            </Link>
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

        {error && (
          <div className="bg-red-900 text-red-300 px-4 py-3 rounded-lg mb-4 border border-red-700">
            {error}
          </div>
        )}

        {/* Search Container */}
        <div className="flex items-center bg-gray-800 rounded-lg px-4 py-3 mb-4 border border-gray-700">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
          />
        </div>

        {/* Filter Pills */}
        {departments.length > 0 && (
          <div className="flex items-center mb-6">
            <span className="text-gray-400 text-sm mr-3">Department:</span>
            <div className="flex flex-wrap gap-2">
              {departmentOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDepartmentFilter(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    (option.value === 'all' && !departmentFilter) || departmentFilter === option.value
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
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-400 mb-4">
              {searchText || departmentFilter ? 'No employees found matching your criteria' : 'No employees registered yet'}
            </p>
            {!searchText && !departmentFilter && (
              <Link
                href="/employees/create"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add First Employee
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {getInitials(employee.name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{employee.name}</h3>
                      {employee.position && (
                        <p className="text-gray-400 text-sm">{employee.position}</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-green-500 px-2 py-1 rounded text-xs font-medium text-gray-900">
                    Active
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {employee.email && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {employee.email}
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {formatPhoneNumber(employee.phone)}
                    </div>
                  )}
                  {employee.department && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {employee.department}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/employees/edit/${employee.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => confirmDelete(employee.id, employee.name)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteModal.employeeName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        type="danger"
      />
    </main>
  );
}
