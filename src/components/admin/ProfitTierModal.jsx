import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function ProfitTierModal({ isOpen, onClose, onSubmit, tier = null }) {
  const [formData, setFormData] = useState({
    minBalance: 0,
    maxBalance: 0,
    profitPercentage: 0
  });

  useEffect(() => {
    if (tier) {
      setFormData(tier);
    }
  }, [tier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {tier ? 'Editar Nivel de Ganancia' : 'Nuevo Nivel de Ganancia'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Saldo Mínimo (USDT)
              </label>
              <input
                type="number"
                name="minBalance"
                value={formData.minBalance}
                onChange={handleChange}
                min="0"
                step="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Saldo Máximo (USDT)
              </label>
              <input
                type="number"
                name="maxBalance"
                value={formData.maxBalance}
                onChange={handleChange}
                min="0"
                step="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Porcentaje de Ganancia (%)
              </label>
              <input
                type="number"
                name="profitPercentage"
                value={formData.profitPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {tier ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

export default ProfitTierModal;