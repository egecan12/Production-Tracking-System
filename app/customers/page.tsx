"use client";

import { useState, useEffect } from "react";
import { hasModuleAccess, getCurrentUserRole } from "../lib/authUtils";
import AccessDenied from "../components/AccessDenied";
import Link from "next/link";
import { getData, createData, deleteData, getActiveCustomers } from "../lib/dataService";
import ConfirmModal from "../components/ConfirmModal";

// Customer interface
interface Customer {
  id: string;
  name: string;
  company_name: string;
  contact_email: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

// Format phone number function
const formatPhoneNumber = (phoneNumber: string): string => {
  const numbers = phoneNumber.replace(/\D/g, "");
  
  if (numbers.length === 10) {
    return `0(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
  } else if (numbers.length === 11 && numbers.startsWith("0")) {
    return `0(${numbers.slice(1, 4)}) ${numbers.slice(4, 7)} ${numbers.slice(7, 9)} ${numbers.slice(9, 11)}`;
  }
  
  return phoneNumber;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
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
    const userRole = getCurrentUserRole();
    const moduleAccess = hasModuleAccess("customers", userRole);
    setHasAccess(moduleAccess);

    if (moduleAccess) {
      fetchCustomers();
    } else {
      setLoading(false);
    }
  }, []);

  // Filter function
  useEffect(() => {
    let result = [...customers];
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.company_name.toLowerCase().includes(searchLower) ||
        customer.contact_email.toLowerCase().includes(searchLower) ||
        customer.phone_number.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredCustomers(result);
  }, [searchText, customers]);

  async function fetchCustomers() {
    try {
      console.log("Loading customers...");
      const data = await getActiveCustomers<Customer>();
      console.log("Loaded customers:", data);
      setCustomers(data || []);
      setFilteredCustomers(data || []);
    } catch (error: any) {
      console.error("Customer loading error:", error);
      setError("Couldn't load customers: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newCustomer.name.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!newCustomer.company_name.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!newCustomer.contact_email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!newCustomer.phone_number.trim()) {
      setError("Phone number is required.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomer.contact_email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    try {
      setIsAddingCustomer(true);
      setError("");
      
      console.log("Adding new customer:", newCustomer);
      const addedCustomers = await createData<Customer>("customers", newCustomer);
      
      if (addedCustomers && addedCustomers.length > 0) {
        console.log("Customer added:", addedCustomers[0]);
        const updatedCustomers = [...(addedCustomers || []), ...customers];
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
        setNewCustomer({
          name: "",
          company_name: "",
          contact_email: "",
          phone_number: "",
        });
        setShowAddForm(false);
      }
    } catch (error: any) {
      console.error("Customer addition error:", error);
      setError("Couldn't add customer: " + error.message);
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
      
      console.log("Setting customer to inactive:", deleteModal.customerId);
      await deleteData("customers", { id: deleteModal.customerId });
      
      console.log("Customer set to inactive");
      const updatedCustomers = customers.filter((customer) => customer.id !== deleteModal.customerId);
      setCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers);
      
      setDeleteModal({ isOpen: false, customerId: "", customerName: "" });
    } catch (error: any) {
      console.error("Error setting customer to inactive:", error);
      setError("Couldn't set customer to inactive: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (hasAccess === false) {
    return <AccessDenied />;
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Customer Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Customer
            </button>
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

        {/* Add Customer Form */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Company Name</label>
                  <input
                    type="text"
                    value={newCustomer.company_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomer.contact_email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, contact_email: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newCustomer.phone_number}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isAddingCustomer}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  {isAddingCustomer ? 'Adding...' : 'Add Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Container */}
        <div className="flex items-center bg-gray-800 rounded-lg px-4 py-3 mb-6 border border-gray-700">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-400 mb-4">
              {searchText ? 'No customers found matching your criteria' : 'No customers registered yet'}
            </p>
            {!searchText && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add First Customer
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {getInitials(customer.company_name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{customer.company_name}</h3>
                      <p className="text-gray-400 text-sm">{customer.name}</p>
                    </div>
                  </div>
                  <div className="bg-green-500 px-2 py-1 rounded text-xs font-medium text-gray-900">
                    Active
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {customer.contact_email}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {formatPhoneNumber(customer.phone_number)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/customers/edit/${customer.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => confirmDelete(customer.id, customer.company_name)}
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
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteModal.customerName}"? This action cannot be undone.`}
        onConfirm={handleDeleteCustomer}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteLoading}
      />
    </main>
  );
}
