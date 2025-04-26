"use client";

import OrderForm from "../components/OrderForm";
import OrderList from "../components/OrderList";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getData } from "../lib/dataService";

export default function OrdersPage() {
  const [showForm, setShowForm] = useState(true);
  const [showList, setShowList] = useState(true);

  // API'nin çalışıp çalışmadığını kontrol et
  useEffect(() => {
    async function checkApi() {
      try {
        console.log("API kontrol ediliyor...");
        const result = await getData("orders");
        console.log("API yanıtı:", result);
      } catch (error) {
        console.error("API kontrol hatası:", error);
      }
    }
    
    checkApi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium"> Back to Home</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-8 text-center text-gray-100">
          Order Management
        </h1>

        <div className="space-y-8">
          <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
            <div
              className="flex justify-between items-center bg-gray-900 p-4 cursor-pointer"
              onClick={() => setShowForm(!showForm)}
            >
              <h2 className="text-xl font-semibold text-gray-100">
                Create New Order
              </h2>
              <div className="text-gray-400 hover:text-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transition-transform ${
                    showForm ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div
              className={`transition-all overflow-hidden ${
                showForm ? "max-h-full" : "max-h-0"
              }`}
            >
              <div className="p-4">
                <OrderForm />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
            <div
              className="flex justify-between items-center bg-gray-900 p-4 cursor-pointer"
              onClick={() => setShowList(!showList)}
            >
              <h2 className="text-xl font-semibold text-gray-100">
                Existing Orders
              </h2>
              <div className="text-gray-400 hover:text-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transition-transform ${
                    showList ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div
              className={`transition-all overflow-hidden ${
                showList ? "max-h-full" : "max-h-0"
              }`}
            >
              <div className="p-4">
                <OrderList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
