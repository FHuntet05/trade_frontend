// RUTA: frontend/src/pages/QuantitativePage.jsx
// --- INICIO DE LA REFACTORIZACIÓN COMPLETA A DINÁMICO ---

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IOSCard, IOSSegmentedControl } from '../components/ui/IOSComponents';
import Accordion from '../components/ui/Accordion';
import api from '@/api/axiosConfig'; // Se importa el cliente de API.
import Loader from '@/components/common/Loader'; // Se importa un componente de carga.

const QuantitativePage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(0); // El estado del filtro se mantiene.
  const periods = ['7 días', '30 días', '90 días', '180 días']; // Esto podría venir del backend en el futuro.

  // 1. Se introducen estados para manejar los planes, la carga y los errores.
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para la navegación.

  // 2. useEffect para obtener los planes del backend al cargar la página.
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        // --- INICIO DE LA CORRECCIÓN ---
        // Se elimina el prefijo '/api' duplicado. La llamada ahora es relativa a la baseURL.
        const response = await api.get('/quantitative/plans'); 
        // --- FIN DE LA CORRECCIÓN ---
        if (response.data.success) {
          setPlans(response.data.data);
        } else {
          throw new Error('La respuesta de la API no fue exitosa.');
        }
      } catch (err) {
        // La ruta del error ahora mostrará la ruta correcta.
        setError(err.response?.data?.message || 'No se pudieron cargar los planes.');
        console.error("Error fetching quantitative plans:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []); // El array vacío asegura que se ejecute solo una vez.

  // 3. Función para manejar el clic en el botón de compra.
  const handlePurchaseClick = (planId) => {
    // Navega a la nueva página de compra, pasando el ID del plan en la URL.
    navigate(`/quantitative/purchase/${planId}`);
  };

  // 4. Renderizado condicional basado en el estado de carga y error.
  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader /></div>;
    }

    if (error) {
      return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    if (plans.length === 0) {
      return <div className="text-center text-text-secondary py-10">No hay planes disponibles en este momento.</div>;
    }

    // Si todo está bien, se renderiza la lista de planes.
    return plans.map((plan, index) => (
      <motion.div
        key={plan._id} // Se usa el _id de la base de datos como key.
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <IOSCard className="mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-ios-display font-semibold text-lg">{plan.name}</h3>
              <p className="text-text-secondary text-sm">Duración: {plan.durationDays} días</p>
            </div>
            <div className="bg-ios-green/10 px-3 py-1 rounded-full">
              <span className="text-ios-green text-sm font-semibold">+{plan.dailyPercentage}% diario</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Inversión mínima</span>
              <span className="text-text-primary font-medium">${plan.minInvestment}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Inversión máxima</span>
              <span className="text-text-primary font-medium">${plan.maxInvestment}</span>
            </div>
            {/* El retorno total se puede calcular o mostrar si viene del backend */}
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Retorno total aprox.</span>
              <span className="text-ios-green font-medium">{(plan.dailyPercentage * plan.durationDays).toFixed(2)}%</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 bg-ios-green text-white py-3 rounded-ios font-ios text-center"
            onClick={() => handlePurchaseClick(plan._id)} // Se llama a la nueva función.
          >
            Comprar Plan
          </motion.button>
        </IOSCard>
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-system-background ios-safe-top pb-20">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-4">
          Trading Cuantitativo
        </h1>
        
        <div className="mb-6">
          <Accordion title="¿Qué es el Trading Cuantitativo y cómo funciona?">
            <p className="font-ios text-sm text-text-secondary leading-relaxed">
              Es una estrategia de inversión que utiliza modelos matemáticos y algoritmos para tomar decisiones de trading. 
              Nuestros planes te permiten participar en estas estrategias, depositando tus fondos por un período fijo para recibir un retorno diario basado en el rendimiento de los algoritmos.
            </p>
          </Accordion>
        </div>

        {/* El segmented control se mantiene para futura funcionalidad de filtrado */}
        {/* <div className="mb-6">
          <IOSSegmentedControl options={periods} selected={selectedPeriod} onChange={setSelectedPeriod} />
        </div> */}

        {renderContent()}
      </div>
    </div>
  );
};

export default QuantitativePage;
// --- FIN DE LA REFACTORIZACIÓN COMPLETA A DINÁMICO ---