"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function UserRegistrationForm() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !userName) {
      setMessage("Lütfen kullanıcı ID ve kullanıcı adı giriniz.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Supabase'e yeni kullanıcı ekleme
      const { error } = await supabase
        .from("employees")
        .insert([
          {
            id: userId,
            name: userName,
            email: `${userId}@example.com`, // Placeholder email
            phone: "", // Boş telefon numarası
          },
        ])
        .select();

      if (error) throw error;

      setMessage("Kullanıcı başarıyla eklendi!");
      setUserId("");
      setUserName("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-center text-gray-800">
          Yeni Çalışan Ekle
        </h2>

        <div className="space-y-2">
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700"
          >
            Kullanıcı ID
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kullanıcı ID giriniz"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="userName"
            className="block text-sm font-medium text-gray-700"
          >
            Kullanıcı Adı
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kullanıcı adı giriniz"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Ekleniyor..." : "Kullanıcı Ekle"}
        </button>

        {message && (
          <div
            className={`text-center text-sm ${
              message.includes("Hata") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </form>
  );
}
