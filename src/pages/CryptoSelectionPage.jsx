// RUTA: frontend/src/pages/CryptoSelectionPage.jsx (VERSIÓN "NEXUS - STATIC BNB FLOW SYNC")
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { HiChevronRight } from 'react-icons/hi2';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const cryptoLogos = {
    'BEP20-USDT': '/assets/images/networks/bep20-usdt.png',
    'TRC20-USDT': '/assets/images/networks/trc20-usdt.png',
    'BNB': '/assets/images/networks/bnb.png',
    'TRX': '/assets/images/networks/tron.png',
    'LTC': '/assets/images/networks/litecoin.png',
};

const getCryptoLogo = (name) => {
    return cryptoLogos[name] || '/assets/network/default.svg';
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
    // [NEXUS REFINEMENT] - Se elimina 'BNB' de la lista de monedas con monto fijo.
    // Ahora solo los USDT requieren un monto exacto. BNB se tratará como TRX y LTC.
    const fixedAmountCryptos = ['BEP20-USDT', 'TRC20-USDT'];
    let amountToSend = null;

    if (amountNeeded > 0 && fixedAmountCryptos.includes(option.name)) {
        // La lógica para BNB que estaba aquí ahora es innecesaria.
        // Solo aplica para USDT.
        amountToSend = amountNeeded;
    }

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