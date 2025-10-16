import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IOSCard, IOSInput, IOSButton } from '../../../components/ui/IOSComponents';
import { IOSIcon } from '../../../components/ui/IOSIcons';
import { CurrencyDollarIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

const PackageManagementPage = () => {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: 'Plan Básico',
      duration: 7,
      minAmount: 100,
      maxAmount: 1000,
      dailyReturn: 0.8,
      enabled: true
    },
    // Más paquetes...
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-system-background pb-20">
      {/* Header */}
      <div className="bg-ios-green text-white p-6">
        <h1 className="text-2xl font-ios-display font-bold">Paquetes de Inversión</h1>
        <p className="text-white/80">Gestión de planes de stock trading</p>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="w-full bg-ios-green text-white py-3 rounded-ios font-ios text-center"
        >
          Añadir Nuevo Paquete
        </motion.button>

        {/* Lista de paquetes */}
        {packages.map(pkg => (
          <PackageCard key={pkg.id} package={pkg} />
        ))}
      </div>

      {/* Modal para añadir/editar paquete */}
      {showAddForm && (
        <PackageForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
};

const PackageCard = ({ package: pkg }) => {
  return (
    <IOSCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-ios-green/10 rounded-full flex items-center justify-center">
            <IOSIcon icon={StarIcon} size="md" className="text-ios-green" />
          </div>
          <div>
            <h3 className="font-ios-display font-semibold">{pkg.name}</h3>
            <p className="text-text-secondary text-sm">{pkg.duration} días</p>
          </div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={\`px-4 py-1 rounded-full text-sm font-ios \${
            pkg.enabled 
              ? 'bg-ios-green text-white' 
              : 'bg-gray-200 text-gray-500'
          }\`}
        >
          {pkg.enabled ? 'Activo' : 'Inactivo'}
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-text-secondary">
            <IOSIcon icon={CurrencyDollarIcon} size="sm" />
            <span className="text-sm">Inversión Min/Max</span>
          </div>
          <p className="font-ios">
            ${pkg.minAmount} - ${pkg.maxAmount}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-text-secondary">
            <IOSIcon icon={ClockIcon} size="sm" />
            <span className="text-sm">Retorno Diario</span>
          </div>
          <p className="font-ios text-ios-green">
            +{pkg.dailyReturn}%
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-system-separator flex justify-end space-x-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-ios text-sm font-ios text-ios-green"
        >
          Editar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-ios text-sm font-ios text-red-500"
        >
          Eliminar
        </motion.button>
      </div>
    </IOSCard>
  );
};

const PackageForm = ({ onClose, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    duration: '',
    minAmount: '',
    maxAmount: '',
    dailyReturn: '',
    enabled: true
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="w-full bg-white rounded-t-ios-xl p-6 space-y-6"
      >
        <h2 className="text-xl font-ios-display font-bold">
          {initialData ? 'Editar Paquete' : 'Nuevo Paquete'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Nombre del Paquete
            </label>
            <IOSInput
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Plan Básico"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Duración (días)
              </label>
              <IOSInput
                type="number"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Ej: 7"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Retorno Diario (%)
              </label>
              <IOSInput
                type="number"
                value={formData.dailyReturn}
                onChange={e => setFormData({ ...formData, dailyReturn: e.target.value })}
                placeholder="Ej: 0.8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Inversión Mínima ($)
              </label>
              <IOSInput
                type="number"
                value={formData.minAmount}
                onChange={e => setFormData({ ...formData, minAmount: e.target.value })}
                placeholder="Ej: 100"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Inversión Máxima ($)
              </label>
              <IOSInput
                type="number"
                value={formData.maxAmount}
                onChange={e => setFormData({ ...formData, maxAmount: e.target.value })}
                placeholder="Ej: 1000"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <IOSButton
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </IOSButton>
          <IOSButton
            variant="primary"
            className="flex-1"
            onClick={() => {
              // Lógica para guardar
              onClose();
            }}
          >
            Guardar
          </IOSButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PackageManagementPage;