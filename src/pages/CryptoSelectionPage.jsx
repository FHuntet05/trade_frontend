// RUTA: frontend/src/pages/CryptoSelectionPage.jsx (VERSIÓN "NEXUS DEPOSIT FLOW - STABLE ICONS & LOGIC")
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { HiChevronRight } from 'react-icons/hi2';
import StaticPageLayout from '../components/layout/StaticPageLayout';

// [NEXUS DEPOSIT FLOW] - Paso 1: Mapeo de iconos locales.
// Ignoramos la URL de la API y usamos nuestros propios iconos para fiabilidad.
// Asegúrese de que estos archivos existan en `public/assets/network/`.
const cryptoLogos = {
    'BEP20-USDT': '/assets/network/bep20-usdt.png',
    'TRC20-USDT': '/assets/network/trc20-usdt.svg',
    'BNB': '/assets/network/bnb.png',
    'TRX': '/assets/network/tron.png',
    'LTC': '/assets/network/litecoin.png',
    // Añada aquí más mapeos si agrega más monedas.
};

// Función de ayuda para obtener el logo correcto o un placeholder.
const getCryptoLogo = (name) => {
    return cryptoLogos[name] || '/assets/network/default.svg'; // Un ícono por defecto si no se encuentra.
};

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

const DepositOptionItem = ({ option, onSelect, index, totalItems }) => {
    const borderClasses = 
        index === 0 && totalItems > 1 ? 'rounded-t-xl' :
        index === totalItems - 1 && totalItems > 1 ? 'rounded-b-xl' :
        totalItems === 1 ? 'rounded-xl' :
        '';

    return (
        <motion.button
            variants={itemVariants}
            onClick={() => onSelect(option)}
            className={`w-full flex items-center p-4 hover:bg-white/10 transition-colors ${borderClasses}`}
        >
            {/* Usamos nuestra función getCryptoLogo en lugar de option.logo */}
            <img src={getCryptoLogo(option.name)} alt={option.name} className="w-10 h-10 rounded-full mr-4 bg-dark-primary object-cover" />
            <span className="font-bold text-white text-lg">{option.name}</span>
            <HiChevronRight className="w-6 h-6 text-text-secondary ml-auto" />
        </motion.button>
    );
};

const CryptoSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { amountNeeded } = location.state || { amountNeeded: 0 };

  const [depositOptions, setDepositOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
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
    // [NEXUS DEPOSIT FLOW] - Paso 2: Lógica de Monto Condicional.
    const fixedAmountCryptos = ['BEP20-USDT', 'TRC20-USDT', 'BNB'];
    let amountToSend = null; // Por defecto, no enviamos monto (depósito manual).

    if (amountNeeded > 0 && fixedAmountCryptos.includes(option.name)) {
        if (option.name === 'BNB') {
            const price = prices[option.chain]; // Usamos la cadena 'BNB' para obtener el precio.
            if (price > 0) {
                amountToSend = amountNeeded / price;
            }
        } else {
            // Para USDT, el monto es directo.
            amountToSend = amountNeeded;
        }
    }

    // Para TRX, LTC, y cualquier otra, amountToSend permanecerá como null.
    navigate('/deposit-details', { 
      state: { 
        option, 
        amountToSend: amountToSend 
      } 
    });
  };

  return (
    <StaticPageLayout title="Recargar Saldo">
        <div className="space-y-3">
            <motion.p 
                initial="hidden" animate="visible" variants={itemVariants}
                className="text-sm text-text-secondary px-1 pb-2">
              Selecciona una moneda para realizar tu depósito.
            </motion.p>

            {isLoading 
            ? <div className="flex justify-center pt-10"><Loader text="Cargando opciones..." /></div>
            : (
                <motion.div 
                    key="options-container" 
                    initial="hidden" 
                    animate="visible" 
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                    className="rounded-xl overflow-hidden divide-y divide-white/10 bg-black/20 backdrop-blur-lg border border-white/10"
                >
                    {depositOptions.map((option, index) => (
                        <DepositOptionItem 
                            key={option.id} 
                            option={option} 
                            onSelect={handleOptionSelected}
                            index={index}
                            totalItems={depositOptions.length}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    </StaticPageLayout>
  );
};

export default CryptoSelectionPage;