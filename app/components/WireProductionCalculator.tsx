"use client";

import { useState, useEffect } from "react";

// Spool types with their max capacities
const spoolTable = {
  "BÜYÜK SİLİNDİRİK TAHTA MAKARA (Ø 740 mm)": { maxKg: 110 },
  "ORTA SİLİNDİRİK TAHTA MAKARA (Ø 640 mm)": { maxKg: 85 },
  "KÜÇÜK PLASTİK MAKARA (Ø 350 mm)": { maxKg: 20 },
};

// Utility function to calculate wire production metrics
const calculateWireProductionMetrics = (params: {
  nakedWeightKg: number;
  totalInsulationKg: number;
  insulationPerMeterGr: number;
  wireLengthMeter: number;
  spoolCount: number;
  crossSectionWidthMm: number;
  crossSectionHeightMm: number;
  totalWeightKg: number;
  theoreticalWeightKg: number;
  actualWeightKg: number;
  theoreticalProduction: number;
  actualProduction: number;
}) => {
  const {
    nakedWeightKg,
    totalInsulationKg,
    insulationPerMeterGr,
    wireLengthMeter,
    spoolCount,
    crossSectionWidthMm,
    crossSectionHeightMm,
    totalWeightKg,
    theoreticalWeightKg,
    actualWeightKg,
    theoreticalProduction,
    actualProduction,
  } = params;

  // Calculate metrics
  const insulationTotalFromGr = (insulationPerMeterGr * wireLengthMeter) / 1000;
  const insulationRatio = (totalInsulationKg / nakedWeightKg) * 100;
  const insulationPerSpool = totalInsulationKg / spoolCount;
  const effectiveTotalWeight = nakedWeightKg + totalInsulationKg;
  const effectiveWeightEfficiency =
    (effectiveTotalWeight / totalWeightKg) * 100;
  const crossSectionAreaMm2 = crossSectionWidthMm * crossSectionHeightMm;
  const wireWeightKg =
    (wireLengthMeter * crossSectionAreaMm2 * 8.96) / 1_000_000;
  const fireRate =
    ((theoreticalWeightKg - actualWeightKg) / theoreticalWeightKg) * 100;
  const efficiency = (actualProduction / theoreticalProduction) * 100;

  return {
    insulationTotalFromGr,
    insulationRatio,
    insulationPerSpool,
    effectiveTotalWeight,
    effectiveWeightEfficiency,
    crossSectionAreaMm2,
    wireWeightKg,
    fireRate,
    efficiency,
  };
};

export default function WireProductionCalculator() {
  // State for input values
  const [inputs, setInputs] = useState({
    nakedWeightKg: 0,
    totalInsulationKg: 0,
    insulationPerMeterGr: 0,
    wireLengthMeter: 0,
    spoolCount: 0,
    crossSectionWidthMm: 0,
    crossSectionHeightMm: 0,
    totalWeightKg: 0,
    theoreticalWeightKg: 0,
    actualWeightKg: 0,
    theoreticalProduction: 0,
    actualProduction: 0,
  });

  // State for selected spool type
  const [selectedSpool, setSelectedSpool] = useState<string>("");

  // State for calculated metrics
  const [metrics, setMetrics] = useState({
    insulationTotalFromGr: 0,
    insulationRatio: 0,
    insulationPerSpool: 0,
    effectiveTotalWeight: 0,
    effectiveWeightEfficiency: 0,
    crossSectionAreaMm2: 0,
    wireWeightKg: 0,
    fireRate: 0,
    efficiency: 0,
  });

  // Update metrics when inputs change
  useEffect(() => {
    setMetrics(calculateWireProductionMetrics(inputs));
  }, [inputs]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0, // Convert to number, use 0 if invalid
    }));
  };

  // Check if the weight exceeds spool capacity
  const isOverCapacity = () => {
    if (!selectedSpool || !metrics.effectiveTotalWeight) return false;

    const spoolCapacity =
      spoolTable[selectedSpool as keyof typeof spoolTable]?.maxKg || 0;
    const weightPerSpool =
      inputs.spoolCount > 0
        ? metrics.effectiveTotalWeight / inputs.spoolCount
        : metrics.effectiveTotalWeight;

    return weightPerSpool > spoolCapacity;
  };

  // Check if cross section area exceeds maximum for hadde
  const isHaddeExceeded = () => {
    return metrics.crossSectionAreaMm2 > 100;
  };

  // Handle select changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSpool(e.target.value);
  };

  // Format numbers for display
  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Fields Section */}
        <div className="bg-gray-800 shadow-md rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-blue-400 mb-4">
            Giriş Parametreleri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="nakedWeightKg"
                className="block text-sm font-medium text-gray-300"
              >
                Çıplak Ağırlık (kg)
              </label>
              <input
                id="nakedWeightKg"
                name="nakedWeightKg"
                type="number"
                step="0.01"
                value={inputs.nakedWeightKg || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="totalInsulationKg"
                className="block text-sm font-medium text-gray-300"
              >
                Toplam İzolasyon (kg)
              </label>
              <input
                id="totalInsulationKg"
                name="totalInsulationKg"
                type="number"
                step="0.01"
                value={inputs.totalInsulationKg || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="insulationPerMeterGr"
                className="block text-sm font-medium text-gray-300"
              >
                Metre Başı İzolasyon (gr)
              </label>
              <input
                id="insulationPerMeterGr"
                name="insulationPerMeterGr"
                type="number"
                step="0.01"
                value={inputs.insulationPerMeterGr || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="wireLengthMeter"
                className="block text-sm font-medium text-gray-300"
              >
                Kablo Uzunluğu (m)
              </label>
              <input
                id="wireLengthMeter"
                name="wireLengthMeter"
                type="number"
                step="0.01"
                value={inputs.wireLengthMeter || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="spoolCount"
                className="block text-sm font-medium text-gray-300"
              >
                Makara Sayısı
              </label>
              <input
                id="spoolCount"
                name="spoolCount"
                type="number"
                step="1"
                value={inputs.spoolCount || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="crossSectionWidthMm"
                className="block text-sm font-medium text-gray-300"
              >
                Kesit Genişliği (mm)
              </label>
              <input
                id="crossSectionWidthMm"
                name="crossSectionWidthMm"
                type="number"
                step="0.01"
                value={inputs.crossSectionWidthMm || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="crossSectionHeightMm"
                className="block text-sm font-medium text-gray-300"
              >
                Kesit Yüksekliği (mm)
              </label>
              <input
                id="crossSectionHeightMm"
                name="crossSectionHeightMm"
                type="number"
                step="0.01"
                value={inputs.crossSectionHeightMm || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="totalWeightKg"
                className="block text-sm font-medium text-gray-300"
              >
                Toplam Ağırlık (kg)
              </label>
              <input
                id="totalWeightKg"
                name="totalWeightKg"
                type="number"
                step="0.01"
                value={inputs.totalWeightKg || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="theoreticalWeightKg"
                className="block text-sm font-medium text-gray-300"
              >
                Teorik Ağırlık (kg)
              </label>
              <input
                id="theoreticalWeightKg"
                name="theoreticalWeightKg"
                type="number"
                step="0.01"
                value={inputs.theoreticalWeightKg || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="actualWeightKg"
                className="block text-sm font-medium text-gray-300"
              >
                Gerçek Ağırlık (kg)
              </label>
              <input
                id="actualWeightKg"
                name="actualWeightKg"
                type="number"
                step="0.01"
                value={inputs.actualWeightKg || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="theoreticalProduction"
                className="block text-sm font-medium text-gray-300"
              >
                Teorik Üretim
              </label>
              <input
                id="theoreticalProduction"
                name="theoreticalProduction"
                type="number"
                step="0.01"
                value={inputs.theoreticalProduction || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="actualProduction"
                className="block text-sm font-medium text-gray-300"
              >
                Gerçek Üretim
              </label>
              <input
                id="actualProduction"
                name="actualProduction"
                type="number"
                step="0.01"
                value={inputs.actualProduction || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            {/* Spool Selection Dropdown */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="spoolType"
                className="block text-sm font-medium text-gray-300"
              >
                Makara Tipi
              </label>
              <select
                id="spoolType"
                name="spoolType"
                value={selectedSpool}
                onChange={handleSelectChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              >
                <option value="">Makara tipini seçin</option>
                {Object.keys(spoolTable).map((spoolType) => (
                  <option key={spoolType} value={spoolType}>
                    {spoolType} - (Maks:{" "}
                    {spoolTable[spoolType as keyof typeof spoolTable].maxKg} kg)
                  </option>
                ))}
              </select>

              {isOverCapacity() && (
                <div className="mt-2 text-red-400 font-medium flex items-center">
                  <span className="text-lg mr-1">❗</span>
                  <span>Seçilen makara kapasitesini aşıyor!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gray-800 shadow-md rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-red-400 mb-4">
            Hesaplanan Metrikler
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">
                İzolasyon Toplamı (gr&apos;dan kg)
              </p>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(metrics.insulationTotalFromGr)} kg
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">İzolasyon Oranı</p>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(metrics.insulationRatio)}%
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">
                Makara Başı İzolasyon
              </p>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(metrics.insulationPerSpool)} kg/makara
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">
                Efektif Toplam Ağırlık
              </p>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(metrics.effectiveTotalWeight)} kg
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">
                Efektif Ağırlık Verimliliği
              </p>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(metrics.effectiveWeightEfficiency)}%
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">Kesit Alanı</p>
              <p
                className={`text-lg font-bold ${
                  isHaddeExceeded() ? "text-amber-400" : "text-gray-100"
                }`}
              >
                {formatNumber(metrics.crossSectionAreaMm2)} mm²
                {isHaddeExceeded() && (
                  <span className="ml-2 text-amber-400 text-sm">⚠️</span>
                )}
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">Tel Ağırlığı</p>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(metrics.wireWeightKg)} kg
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">Fire Oranı</p>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(metrics.fireRate)}%
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">Verimlilik</p>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(metrics.efficiency)}%
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">Makara Başı Ağırlık</p>
              <p
                className={`text-lg font-bold ${
                  isOverCapacity() ? "text-red-400" : "text-gray-100"
                }`}
              >
                {inputs.spoolCount > 0
                  ? formatNumber(
                      metrics.effectiveTotalWeight / inputs.spoolCount
                    )
                  : formatNumber(metrics.effectiveTotalWeight)}{" "}
                kg/makara
                {isOverCapacity() && (
                  <span className="ml-2 text-red-400 text-sm">❗</span>
                )}
              </p>
            </div>
          </div>

          {/* Hadde warning */}
          {isHaddeExceeded() && (
            <div className="mt-6 bg-red-900/30 border border-red-700 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <span className="text-2xl mr-2 text-amber-400">⚠️</span>
                <span className="text-amber-400 font-medium">
                  Hadde Kontrolü:
                </span>
                <span className="text-amber-200 ml-2">
                  Bu kesit çok büyük – haddeye sığmayabilir.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
