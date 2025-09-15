// RUTA: frontend/src/pages/CryptoSelectionPage.jsx (VERSIÓN "NEXUS - HÍBRIDA")
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { HiChevronRight } from 'react-icons/hi2';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

// Componente para cada item en la lista de pago, basado en su imagen de referencia.
const DepositOptionItem = ({ option, onSelect }) => (
  <motion.button
    variants={itemVariants}
    onClick={() => onSelect(option)}
    className="w-full flex items-center p-4 bg-dark-secondary rounded-lg hover:bg-dark-tertiary transition-colors"
  >
    <img src={option.logo} alt={option.name} className="w-10 h-10 rounded-full mr-4" />
    <span className="font-bold text-white text-lg">{option.name}</span>
    <HiChevronRight className="w-6 h-6 text-text-secondary ml-auto" />
  </motion.button>
);

const CryptoSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // El 'amountNeeded' puede venir de ToolsPage (si el saldo es insuficiente) o ser nulo (si se accede desde el perfil).
  const { amountNeeded } = location.state || { amountNeeded: 0 };

  const [depositOptions, setDepositOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Hacemos ambas llamadas a la API en paralelo para eficiencia.
        const [optionsResponse, pricesResponse] = await Promise.all([
          api.get('/payment/deposit-options'),
          api.get('/payment/prices')
        ]);
        setDepositOptions(optionsResponse.data);
        setPrices(pricesResponse.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error al cargar las opciones de depósito.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOptionSelected = (option) => {
    let amountToSend = amountNeeded;
    const price = prices[option.chain]; // Usamos la cadena como clave (BNB, TRX, LTC)
    
    // Si se necesita un monto específico y la moneda no es USDT, calculamos el equivalente.
    if (amountToSend > 0 && option.name !== 'BEP20-USDT' && option.name !== 'TRC20-USDT' && price > 0) {
      amountToSend = amountNeeded / price;
    }

    // Navegamos a una nueva página de detalles, pasando toda la información necesaria.
    navigate('/deposit-details', { 
      state: { 
        option, 
        amountToSend: amountToSend > 0 ? amountToSend : null // Si no hay monto, pasamos null
      } 
    });
  };

  return (
    <StaticPageLayout title="Recargar Saldo">
        <motion.div 
            key="content" 
            initial="hidden" 
            animate="visible" 
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            className="space-y-3"
        >
            <motion.p variants={itemVariants} className="text-sm text-text-secondary px-1 pb-2">
              Selecciona una moneda para realizar tu depósito.
            </motion.p>

            {isLoading 
            ? <div className="flex justify-center pt-10"><Loader text="Cargando opciones..." /></div>
            : depositOptions.map((option) => (
                <DepositOptionItem 
                    key={option.id} 
                    option={option} 
                    onSelect={handleOptionSelected}
                />
            ))
            }
        </motion.div>
    </StaticPageLayout>
  );
};

export default CryptoSelectionPage;