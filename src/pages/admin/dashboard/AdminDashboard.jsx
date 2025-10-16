import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IOSCard, IOSSegmentedControl, IOSLoader } from '@components/ui/IOSComponents';
import { IOSIcon } from '@components/ui/IOSIcons';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  UsersIcon, 
  CogIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useAdminStore } from '@store';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new: 0 },
    trading: { volume24h: 0, totalVolume: 0 },
    deposits: { today: 0, total: 0 },
    withdrawals: { pending: 0, total: 0 }
  });

  const navigate = useNavigate();
  const { admin, api } = useAdminStore();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sections = {
    overview: { icon: ChartBarIcon, title: 'Vista General' },
    users: { icon: UsersIcon, title: 'Usuarios' },
    trading: { icon: BanknotesIcon, title: 'Trading' },
    settings: { icon: CogIcon, title: 'Ajustes' }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-system-background flex items-center justify-center">
        <IOSLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-system-background pb-20">
      {/* Header */}
      <div className="bg-ios-green text-white p-6">
        <h1 className="text-2xl font-ios-display font-bold">Panel de Control</h1>
        <p className="text-white/80">Administración del sistema</p>
      </div>

      {/* Secciones */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {Object.entries(sections).map(([key, { icon, title }]) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedSection(key)}
            className={
              selectedSection === key 
                ? 'bg-ios-green text-white p-4 rounded-ios-xl shadow-ios-card flex flex-col items-center justify-center gap-2' 
                : 'bg-white text-text-primary p-4 rounded-ios-xl shadow-ios-card flex flex-col items-center justify-center gap-2'
            }
          >
            <IOSIcon icon={icon} size="lg" className={selectedSection === key ? 'text-white' : 'text-ios-green'} />
            <span className="font-ios text-sm">{title}</span>
          </motion.button>
        ))}
      </div>

      {/* Contenido de la sección */}
      <div className="p-4">
        {selectedSection === 'overview' && <OverviewSection stats={stats} />}
        {selectedSection === 'users' && <UsersSection stats={stats.users} />}
        {selectedSection === 'trading' && <TradingSection stats={stats.trading} />}
        {selectedSection === 'settings' && <SettingsSection />}
      </div>
    </div>
  );
};

const OverviewSection = ({ stats }) => {
  const overviewStats = [
    { 
      title: 'Usuarios Activos', 
      value: stats.users.active.toLocaleString(),
      change: '+15%',
      icon: UserGroupIcon,
      color: 'text-blue-500'
    },
    { 
      title: 'Trading 24h', 
      value: `$${stats.trading.volume24h.toLocaleString()}`,
      change: '+23%',
      icon: ArrowTrendingUpIcon,
      color: 'text-green-500'
    },
    { 
      title: 'Depósitos Hoy', 
      value: `$${stats.deposits.today.toLocaleString()}`,
      change: '+8%',
      icon: ArrowDownTrayIcon,
      color: 'text-purple-500'
    },
    { 
      title: 'Retiros Pendientes', 
      value: stats.withdrawals.pending.toLocaleString(),
      change: '-5%',
      icon: CurrencyDollarIcon,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {overviewStats.map(stat => (
          <IOSCard key={stat.title} className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${stat.color} bg-opacity-10`}>
                <IOSIcon icon={stat.icon} size="sm" className={stat.color} />
              </div>
              <p className="text-text-secondary text-sm">{stat.title}</p>
            </div>
            <p className="text-xl font-ios-display font-bold">{stat.value}</p>
            <p className={
              stat.change.startsWith('+') 
                ? 'text-sm text-ios-green' 
                : 'text-sm text-red-500'
            }>
              {stat.change}
            </p>
          </IOSCard>
        ))}
      </div>

      <IOSCard className="p-4">
        <h3 className="font-ios-display font-semibold mb-4">
          Resumen de Actividad
        </h3>
        {/* Aquí irían los gráficos */}
      </IOSCard>
    </div>
  );
};

const UsersSection = () => {
  // Implementación de gestión de usuarios
  return (
    <div>
      {/* Lista de usuarios, filtros, acciones, etc. */}
    </div>
  );
};

const TradingSection = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const tabs = ['Monedas', 'Paquetes', 'Reglas'];

  return (
    <div className="space-y-6">
      <IOSSegmentedControl
        options={tabs}
        selected={selectedTab}
        onChange={setSelectedTab}
      />

      {selectedTab === 0 && (
        <CoinManagement />
      )}
      {selectedTab === 1 && (
        <PackageManagement />
      )}
      {selectedTab === 2 && (
        <TradingRules />
      )}
    </div>
  );
};

const CoinManagement = () => {
  const [coins, setCoins] = useState([
    { 
      id: 1,
      symbol: 'BTC',
      name: 'Bitcoin',
      enabled: true,
      minInvestment: 10,
      profitRange: { min: 2, max: 8 }
    }
  ]);

  return (
    <div className="space-y-4">
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="w-full bg-ios-green text-white py-3 rounded-ios font-ios text-center"
      >
        Añadir Nueva Moneda
      </motion.button>

      {coins.map(coin => (
        <IOSCard key={coin.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ios-green/10 rounded-full flex items-center justify-center">
                <span className="font-ios-display font-bold text-ios-green">
                  {coin.symbol.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-ios-display font-semibold">{coin.name}</h3>
                <p className="text-text-secondary text-sm">{coin.symbol}</p>
              </div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={
                coin.enabled 
                  ? 'px-4 py-1 rounded-full text-sm font-ios bg-ios-green text-white'
                  : 'px-4 py-1 rounded-full text-sm font-ios bg-gray-200 text-gray-500'
              }
            >
              {coin.enabled ? 'Activa' : 'Inactiva'}
            </motion.button>
          </div>

          <div className="mt-4 pt-4 border-t border-system-separator space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Inversión Mínima</span>
              <span className="text-text-primary">${coin.minInvestment} USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Rango de Ganancia</span>
              <span className="text-ios-green">
                {coin.profitRange.min}% - {coin.profitRange.max}%
              </span>
            </div>
          </div>
        </IOSCard>
      ))}
    </div>
  );
};

const PackageManagement = () => {
  // Implementación de gestión de paquetes de inversión
  return (
    <div>
      {/* Lista de paquetes, editor, etc. */}
    </div>
  );
};

const TradingRules = () => {
  // Implementación de reglas de trading
  return (
    <div>
      {/* Configuración de reglas, límites, etc. */}
    </div>
  );
};

const SettingsSection = () => {
  // Implementación de configuración del sistema
  return (
    <div>
      {/* Configuraciones generales */}
    </div>
  );
};

export default AdminDashboard;