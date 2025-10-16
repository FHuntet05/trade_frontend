import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IOSCard, IOSInput, IOSButton } from '../../../components/ui/IOSComponents';
import { IOSIcon } from '../../../components/ui/IOSIcons';
import { ChartBarIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';

const WheelManagementPage = () => {
  const [rewards, setRewards] = useState([
    {
      id: 1,
      type: 'xp',
      value: 100,
      probability: 0.4,
      enabled: true
    },
    {
      id: 2,
      type: 'usdt',
      value: 0.0001,
      probability: 0.15,
      enabled: true
    },
    {
      id: 3,
      type: 'spins',
      value: 1,
      probability: 0.04,
      enabled: true
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-system-background pb-20">
      {/* Header */}
      <div className="bg-ios-green text-white p-6">
        <h1 className="text-2xl font-ios-display font-bold">Ruleta de Premios</h1>
        <p className="text-white/80">Configuración de premios y probabilidades</p>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4">
          <IOSCard className="p-4">
            <div className="flex items-center space-x-3">
              <IOSIcon icon={ChartBarIcon} size="lg" className="text-ios-green" />
              <div>
                <p className="text-text-secondary text-sm">Giros Hoy</p>
                <p className="text-xl font-ios-display font-bold">1,234</p>
              </div>
            </div>
          </IOSCard>

          <IOSCard className="p-4">
            <div className="flex items-center space-x-3">
              <IOSIcon icon={SparklesIcon} size="lg" className="text-ios-green" />
              <div>
                <p className="text-text-secondary text-sm">XP Distribuido</p>
                <p className="text-xl font-ios-display font-bold">45.6K</p>
              </div>
            </div>
          </IOSCard>
        </div>

        {/* Premios */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-ios-display font-bold">Premios</h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="bg-ios-green text-white px-4 py-2 rounded-ios text-sm font-ios"
            >
              Añadir Premio
            </motion.button>
          </div>

          {rewards.map(reward => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      </div>

      {/* Modal para añadir/editar premio */}
      {showAddForm && (
        <RewardForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
};

const RewardCard = ({ reward }) => {
  const getRewardIcon = (type) => {
    switch (type) {
      case 'xp':
        return SparklesIcon;
      case 'usdt':
        return ChartBarIcon;
      case 'spins':
        return ClockIcon;
      default:
        return SparklesIcon;
    }
  };

  const getRewardLabel = (type, value) => {
    switch (type) {
      case 'xp':
        return `${value} XP`;
      case 'usdt':
        return `${value} USDT`;
      case 'spins':
        return `${value} ${value === 1 ? 'Giro' : 'Giros'}`;
      default:
        return `${value}`;
    }
  };

  return (
    <IOSCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-ios-green/10 rounded-full flex items-center justify-center">
            <IOSIcon 
              icon={getRewardIcon(reward.type)} 
              size="md" 
              className="text-ios-green" 
            />
          </div>
          <div>
            <h3 className="font-ios-display font-semibold">
              {getRewardLabel(reward.type, reward.value)}
            </h3>
            <p className="text-text-secondary text-sm">
              Probabilidad: {(reward.probability * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-1 rounded-full text-sm font-ios ${
            reward.enabled 
              ? 'bg-ios-green text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {reward.enabled ? 'Activo' : 'Inactivo'}
        </motion.button>
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

const RewardForm = ({ onClose, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    type: 'xp',
    value: '',
    probability: '',
    enabled: true
  });

  const types = [
    { value: 'xp', label: 'XP' },
    { value: 'usdt', label: 'USDT' },
    { value: 'spins', label: 'Giros' }
  ];

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
          {initialData ? 'Editar Premio' : 'Nuevo Premio'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Tipo de Premio
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 rounded-ios bg-system-secondary text-text-primary font-ios border-0 focus:ring-2 focus:ring-ios-green focus:outline-none"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Valor
            </label>
            <IOSInput
              type="number"
              value={formData.value}
              onChange={e => setFormData({ ...formData, value: e.target.value })}
              placeholder="Ej: 100 para XP, 0.0001 para USDT"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Probabilidad (%)
            </label>
            <IOSInput
              type="number"
              value={formData.probability}
              onChange={e => setFormData({ ...formData, probability: e.target.value })}
              placeholder="Ej: 40 para 40%"
            />
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

export default WheelManagementPage;