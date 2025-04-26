"use client";

import { useState, useEffect } from "react";
import { hasModuleAccess, getCurrentUserRole } from "../lib/authUtils";
import AccessDenied from "../components/AccessDenied";
import Link from "next/link";
import { getData, createData, deleteData, getActiveCustomers } from "../lib/dataService";
import ConfirmModal from "../components/ConfirmModal";

// Customer interface (should be the same type)
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
  // Get only numbers
  const numbers = phoneNumber.replace(/\D/g, "");

  // Turkish phone format: 0(5XX) XXX XX XX
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

  // If not formattable, return as is
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
    // Check access control
    const userRole = getCurrentUserRole();
    const moduleAccess = hasModuleAccess("customers", userRole);
    setHasAccess(moduleAccess);

    // If access exists, load data
    if (moduleAccess) {
      fetchCustomers();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchCustomers() {
    try {
      console.log("Loading customers...");
      const data = await getActiveCustomers<Customer>();
      console.log("Loaded customers:", data);
      setCustomers(data || []);
    } catch (error: any) {
      console.error("Customer loading error:", error);
      setError("Couldn't load customers: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsAddingCustomer(true);
      
      console.log("Adding new customer:", newCustomer);
      const addedCustomers = await createData<Customer>("customers", newCustomer);
      
      if (addedCustomers && addedCustomers.length > 0) {
        console.log("Customer added:", addedCustomers[0]);
        setCustomers([...(addedCustomers || []), ...customers]);
        setNewCustomer({
          name: "",
          company_name: "",
          contact_email: "",
          phone_number: "",
        });
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
      setCustomers(
        customers.filter((customer) => customer.id !== deleteModal.customerId)
      );
      
      setDeleteModal({ isOpen: false, customerId: "", customerName: "" });
    } catch (error: any) {
      console.error("Error setting customer to inactive:", error);
      setError("Couldn't set customer to inactive: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  // If no access, show access denied page
  if (hasAccess === false) {
    return <AccessDenied />;
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">
            Customer Management
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
              Home
            </Link>
            <button
              onClick={() => setIsAddingCustomer(!isAddingCustomer)}
              className={`${
                isAddingCustomer
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-medium py-2 px-4 rounded`}
            >
              {isAddingCustomer ? "Cancel" : "Add New Customer"}
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
              Add New Customer
            </h2>
            <form onSubmit={handleAddCustomer}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Customer Name*
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
                    Company Name
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
                    Email
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    value={newCustomer.phone_number}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        phone_number: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0(5XX) XXX XX XX"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-full"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-300">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            No customers found. Add a new customer to get started.
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-base font-medium text-gray-200">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {customer.company_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-200">
                          {customer.contact_email}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatPhoneNumber(customer.phone_number)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            confirmDelete(customer.id, customer.name)
                          }
                          className="text-red-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="Delete Customer"
          message={`Are you sure you want to delete "${deleteModal.customerName}"? This action will set the customer to inactive.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteCustomer}
          onCancel={cancelDelete}
          isLoading={deleteLoading}
        />
      </div>
    </main>
  );
}
