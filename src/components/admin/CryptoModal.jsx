import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function CryptoModal({ isOpen, onClose, onSubmit, crypto = null }) {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    icon: '',
    minInvestment: 10,
    maxInvestment: 1000,
    profitRange: {
      min: 1,
      max: 5
    },
    isActive: true,
    displayOrder: 0
  });

  useEffect(() => {
    if (crypto) {
      setFormData(crypto);
    }
  }, [crypto]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
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
              {crypto ? 'Editar Criptomoneda' : 'Nueva Criptomoneda'}
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
                Símbolo
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL del Ícono
              </label>
              <input
                type="url"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inversión Mínima (USDT)
                </label>
                <input
                  type="number"
                  name="minInvestment"
                  value={formData.minInvestment}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inversión Máxima (USDT)
                </label>
                <input
                  type="number"
                  name="maxInvestment"
                  value={formData.maxInvestment}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ganancia Mínima (%)
                </label>
                <input
                  type="number"
                  name="profitRange.min"
                  value={formData.profitRange.min}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ganancia Máxima (%)
                </label>
                <input
                  type="number"
                  name="profitRange.max"
                  value={formData.profitRange.max}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'isActive',
                      value: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600"
                />
                <label className="text-sm font-medium text-gray-700">
                  Activo
                </label>
              </div>
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
                {crypto ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

export default CryptoModal;