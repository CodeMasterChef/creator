"use client";

import { useState } from "react";
import { Clock, Save } from "lucide-react";

interface IntervalSettingsProps {
  currentIntervalMinutes: number;
  variant?: "inline";
}

export default function IntervalSettings({ currentIntervalMinutes, variant }: IntervalSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Convert current interval to appropriate unit
  const getInitialValues = (): { value: number; unit: 'minutes' | 'hours' } => {
    if (currentIntervalMinutes < 60) {
      return { value: currentIntervalMinutes, unit: 'minutes' };
    } else {
      return { value: currentIntervalMinutes / 60, unit: 'hours' };
    }
  };

  const initial = getInitialValues();
  const [intervalValue, setIntervalValue] = useState(initial.value);
  const [intervalUnit, setIntervalUnit] = useState<'minutes' | 'hours'>(initial.unit);

  const handleSave = async () => {
    // Convert to minutes
    const totalMinutes = intervalUnit === 'hours'
      ? intervalValue * 60
      : intervalValue;

    if (totalMinutes < 1) {
      alert('Khoảng thời gian phải lớn hơn 0');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/interval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMinutes: totalMinutes })
      });

      if (response.ok) {
        alert('✅ Đã lưu cài đặt thành công!');
        setIsEditing(false);
        window.location.reload();
      } else {
        alert('❌ Lỗi khi lưu cài đặt');
      }
    } catch (error) {
      alert('❌ Lỗi khi lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const displayInterval = () => {
    if (currentIntervalMinutes < 60) {
      return `${currentIntervalMinutes} phút`;
    } else if (currentIntervalMinutes % 60 === 0) {
      return `${currentIntervalMinutes / 60} giờ`;
    } else {
      const hours = Math.floor(currentIntervalMinutes / 60);
      const minutes = currentIntervalMinutes % 60;
      return `${hours} giờ ${minutes} phút`;
    }
  };

  const inline = variant === "inline";

  if (!isEditing) {
    return (
      <div className={`${inline ? "" : "mb-8"} ${inline ? "" : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"} p-0`}>
        <div className={`${inline ? "" : "p-4 sm:p-6"} flex items-start gap-3`}>
          <div className={`p-2 rounded-lg ${inline ? "bg-white/10 dark:bg-white/10" : "bg-yellow-100 dark:bg-yellow-800/30"}`}>
            <Clock className={`w-5 h-5 ${inline ? "text-yellow-200" : "text-primary"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`text-sm sm:text-base font-semibold ${inline ? "text-white" : "text-yellow-900 dark:text-yellow-100"} mb-1`}>
                  ⚡ Cập nhật tự động
                </h3>
                <p className={`text-xs sm:text-sm ${inline ? "text-white/80" : "text-yellow-800 dark:text-yellow-200"}`}>
                  Thu thập tin từ CoinDesk mỗi <strong>{displayInterval()}</strong> và tự động xuất bản.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                  inline
                    ? "bg-white/15 hover:bg-white/25 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
              >
                Thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-3">
            ⚙️ Cài đặt khoảng thời gian tự động
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  min="1"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Đơn vị
                </label>
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as 'minutes' | 'hours')}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="minutes">Phút</option>
                  <option value="hours">Giờ</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/50 p-2 rounded">
              💡 <strong>Preview:</strong> Hệ thống sẽ chạy mỗi {intervalValue} {intervalUnit === 'hours' ? 'giờ' : 'phút'}
              {intervalUnit === 'hours' && intervalValue > 0 && ` (${intervalValue * 60} phút)`}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>

              <button
                onClick={() => {
                  setIntervalValue(initial.value);
                  setIntervalUnit(initial.unit);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
