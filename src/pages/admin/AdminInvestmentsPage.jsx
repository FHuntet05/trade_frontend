import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useAdminStore from '../../store/adminStore';
import AdminCard from '../../components/admin/AdminCard';
import { Tab } from '@headlessui/react';
import CryptoModal from '../../components/admin/CryptoModal';
import ProfitTierModal from '../../components/admin/ProfitTierModal';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

function AdminInvestmentsPage() {
  const [cryptoList, setCryptoList] = useState([]);
  const [profitTiers, setProfitTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [isProfitTierModalOpen, setIsProfitTierModalOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const { api } = useAdminStore();

  const fetchData = async () => {
    try {
      const [cryptoRes, tiersRes] = await Promise.all([
        api.get('/admin/crypto-settings'),
        api.get('/admin/profit-tiers')
      ]);

      setCryptoList(cryptoRes.data.data || []);
      setProfitTiers(tiersRes.data.data || []);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCryptoUpdate = async (symbol, data) => {
    try {
      await api.put(`/admin/crypto-settings/${symbol}`, data);
      toast.success('Criptomoneda actualizada con éxito');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar la criptomoneda');
      console.error(error);
    }
  };

  const handleCryptoSubmit = async (data) => {
    try {
      if (selectedCrypto) {
        await api.put(`/admin/crypto-settings/${selectedCrypto.symbol}`, data);
        toast.success('Criptomoneda actualizada con éxito');
      } else {
        await api.post('/admin/crypto-settings', data);
        toast.success('Criptomoneda creada con éxito');
      }
      fetchData();
    } catch (error) {
      toast.error('Error al guardar la criptomoneda');
      console.error(error);
    }
  };

  const handleEditCrypto = (crypto) => {
    setSelectedCrypto(crypto);
    setIsCryptoModalOpen(true);
  };

  const handleNewCrypto = () => {
    setSelectedCrypto(null);
    setIsCryptoModalOpen(true);
  };

  const handleTierSubmit = async (data) => {
    try {
      const currentTiers = [...profitTiers];
      if (selectedTier) {
        // Actualizar tier existente
        const index = currentTiers.findIndex(t => 
          t.minBalance === selectedTier.minBalance && 
          t.maxBalance === selectedTier.maxBalance
        );
        currentTiers[index] = data;
      } else {
        // Agregar nuevo tier
        currentTiers.push(data);
      }
      
      // Ordenar y validar tiers
      const sortedTiers = currentTiers
        .sort((a, b) => a.minBalance - b.minBalance);

      // Verificar superposición
      for (let i = 0; i < sortedTiers.length - 1; i++) {
        if (sortedTiers[i].maxBalance >= sortedTiers[i + 1].minBalance) {
          throw new Error('Los rangos de saldo no pueden superponerse');
        }
      }

      await api.put('/admin/profit-tiers', { profitTiers: sortedTiers });
      toast.success(selectedTier ? 'Nivel actualizado con éxito' : 'Nivel creado con éxito');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Error al guardar el nivel de ganancia');
      console.error(error);
    }
  };

  const handleEditTier = (tier) => {
    setSelectedTier(tier);
    setIsProfitTierModalOpen(true);
  };

  const handleNewTier = () => {
    setSelectedTier(null);
    setIsProfitTierModalOpen(true);
  };

  const handleTierUpdate = async (tiers) => {
    try {
      await api.put('/admin/profit-tiers', { profitTiers: tiers });
      toast.success('Niveles de ganancia actualizados con éxito');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar los niveles de ganancia');
      console.error(error);
    }
  };

  const tabPanels = [
    {
      name: 'Criptomonedas',
      content: (
        <div className="grid gap-6">
          {cryptoList.map((crypto) => (
            <AdminCard key={crypto.symbol} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={crypto.icon} 
                    alt={crypto.name} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{crypto.name}</h3>
                    <p className="text-sm text-gray-500">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleCryptoUpdate(crypto.symbol, {
                      ...crypto,
                      isActive: !crypto.isActive
                    })}
                    className={`px-4 py-2 rounded-lg ${
                      crypto.isActive 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white transition-colors`}
                  >
                    {crypto.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => {/* Abrir modal de edición */}}
                    className="p-2 text-gray-500 hover:text-blue-500"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500">Inversión Mínima</p>
                  <p className="text-lg font-semibold">{crypto.minInvestment} USDT</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500">Inversión Máxima</p>
                  <p className="text-lg font-semibold">{crypto.maxInvestment} USDT</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500">Ganancia Mínima</p>
                  <p className="text-lg font-semibold">{crypto.profitRange.min}%</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500">Ganancia Máxima</p>
                  <p className="text-lg font-semibold">{crypto.profitRange.max}%</p>
                </div>
              </div>
            </AdminCard>
          ))}
          <button
            onClick={handleNewCrypto}
            className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
          >
            <PlusIcon className="w-6 h-6 mr-2" />
            Agregar Nueva Criptomoneda
          </button>
        </div>
      )
    },
    {
      name: 'Niveles de Ganancia',
      content: (
        <div className="grid gap-6">
          {profitTiers.map((tier, index) => (
            <AdminCard key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Nivel {index + 1}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {tier.minBalance} USDT - {tier.maxBalance} USDT
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-xl font-bold text-green-500">
                    {tier.profitPercentage}%
                  </p>
                  <button
                    onClick={() => {/* Abrir modal de edición */}}
                    className="p-2 text-gray-500 hover:text-blue-500"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  {index > 0 && (
                    <button
                      onClick={() => {
                        const newTiers = [...profitTiers];
                        newTiers.splice(index, 1);
                        handleTierUpdate(newTiers);
                      }}
                      className="p-2 text-gray-500 hover:text-red-500"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </AdminCard>
          ))}
          <button
            onClick={handleNewTier}
            className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
          >
            <PlusIcon className="w-6 h-6 mr-2" />
            Agregar Nuevo Nivel
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestión de Inversiones</h1>
        <p className="text-gray-500">
          Administra las criptomonedas disponibles y los niveles de ganancia
        </p>
      </div>

      {/* Modales */}
      <CryptoModal 
        isOpen={isCryptoModalOpen}
        onClose={() => setIsCryptoModalOpen(false)}
        onSubmit={handleCryptoSubmit}
        crypto={selectedCrypto}
      />
      
      <ProfitTierModal
        isOpen={isProfitTierModalOpen}
        onClose={() => setIsProfitTierModalOpen(false)}
        onSubmit={handleTierSubmit}
        tier={selectedTier}
      />

      <Tab.Group onChange={setSelectedTab}>
        <Tab.List className="flex space-x-4 mb-6">
          {tabPanels.map((panel, idx) => (
            <Tab
              key={idx}
              className={({ selected }) =>
                `px-4 py-2 rounded-lg transition-colors ${
                  selected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`
              }
            >
              {panel.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {tabPanels.map((panel, idx) => (
            <Tab.Panel key={idx}>
              {panel.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default AdminInvestmentsPage;