// RUTA: frontend/src/pages/CryptoSelectionPage.jsx (VERSIÓN "NEXUS - VISUAL SYNC")
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { HiChevronRight } from 'react-icons/hi2';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

// [NEXUS VISUAL FIX] - El componente ahora recibe el índice y el total para aplicar bordes condicionales.
const DepositOptionItem = ({ option, onSelect, index, totalItems }) => {
    
    // Construimos las clases de borde dinámicamente.
    const borderClasses = 
        index === 0 && totalItems > 1 ? 'rounded-t-xl' : // Solo el de arriba si hay más de uno
        index === totalItems - 1 && totalItems > 1 ? 'rounded-b-xl' : // Solo el de abajo si hay más de uno
        totalItems === 1 ? 'rounded-xl' : // Redondeado completo si es el único item
        ''; // Sin bordes si está en el medio

    return (
        <motion.button
            variants={itemVariants}
            onClick={() => onSelect(option)}
            // [NEXUS VISUAL FIX] - Clases actualizadas para adaptarse al contenedor.
            // Se quita el fondo individual y el 'rounded-lg' estático.
            className={`w-full flex items-center p-4 bg-dark-secondary hover:bg-dark-tertiary transition-colors ${borderClasses}`}
        >
            <img src={option.logo} alt={option.name} className="w-10 h-10 rounded-full mr-4" />
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
    let amountToSend = amountNeeded;
    const price = prices[option.chain];
    
    if (amountToSend > 0 && option.name !== 'BEP20-USDT' && option.name !== 'TRC20-USDT' && price > 0) {
      amountToSend = amountNeeded / price;
    }

    navigate('/deposit-details', { 
      state: { 
        option, 
        amountToSend: amountToSend > 0 ? amountToSend : null
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
                // [NEXUS VISUAL FIX] - Este es el nuevo contenedor unificado.
                // - rounded-xl: Define la forma exterior.
                // - overflow-hidden: Es la clave, recorta los hijos para que encajen en la forma redondeada.
                // - divide-y & divide-white/10: Crea las líneas separadoras automáticamente.
                <motion.div 
                    key="options-container" 
                    initial="hidden" 
                    animate="visible" 
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                    className="rounded-xl overflow-hidden divide-y divide-white/5"
                >
                    {depositOptions.map((option, index) => (
                        <DepositOptionItem 
                            key={option.id} 
                            option={option} 
                            onSelect={handleOptionSelected}
                            // [NEXUS VISUAL FIX] - Pasamos las props necesarias para el estilo condicional.
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