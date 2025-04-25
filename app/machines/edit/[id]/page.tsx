import React, { useState, useEffect } from "react";
import { Machine } from "@/types/machine";

// Machine form component
const MachineForm: React.FC<{ machineId: string }> = ({ machineId }) => {
  // Machine form data
  const [machine, setMachine] = useState<Machine>({
    id: machineId as string,
    name: "",
    model: "",
    number: "",
    location: "",
    status: "active",
    is_active: true,
  });

  useEffect(() => {
    async function fetchMachine() {
      try {
        // ... existing code ...

        const machineData = data[0];
        setMachine({
          id: machineData.id,
          name: machineData.name,
          model: machineData.model || "",
          number: machineData.number || "",
          location: machineData.location || "",
          status: machineData.status,
          is_active: machineData.is_active === undefined ? true : machineData.is_active,
        });
      } catch (err: unknown) {
        // ... existing code ...
      }
    }

    fetchMachine();
  }, [machineId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... existing form fields ... */}

      <div className="mb-4">
        <label htmlFor="is_active" className="block mb-1 font-medium text-gray-300">
          Durum
        </label>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={machine.is_active}
            onChange={(e) => setMachine({ ...machine, is_active: e.target.checked })}
            className="w-5 h-5 mr-2 rounded accent-blue-500 cursor-pointer"
          />
          <span className="text-gray-300">
            {machine.is_active ? "Aktif" : "Pasif"}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Pasif makineler listede görünmez ve üretim işlemlerinde kullanılamaz.
        </p>
      </div>

      {/* ... existing form buttons ... */}
    </form>
  );
};

export default MachineForm; 