import React from 'react';
import { motion } from 'framer-motion';
import { IOSCard, IOSSegmentedControl } from '../components/ui/IOSComponents';
// --- INICIO DE LA MODIFICACIÓN ---
// 1. Se importa el nuevo componente Accordion.
import Accordion from '../components/ui/Accordion';
// --- FIN DE LA MODIFICACIÓN ---

const QuantitativePage = () => {
  const [selectedPeriod, setSelectedPeriod] = React.useState(0);
  const periods = ['7 días', '30 días', '90 días', '180 días'];

  const stockPackages = [
    {
      id: 1,
      name: 'Plan Básico',
      duration: '7 días',
      minAmount: 100,
      maxAmount: 1000,
      dailyReturn: 0.8,
      totalReturn: 5.6,
      lockPeriod: '7 días'
    },
    // Más paquetes...
  ];

  return (
    <div className="min-h-screen bg-system-background ios-safe-top pb-20">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-4">
          Stock Trading
        </h1>
        
        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        {/* 2. Se implementa el componente Accordion debajo del título. */}
        <div className="mb-6">
          <Accordion title="¿Qué es el Stock Trading y cómo funciona?">
            <p className="space-y-2">
              El Stock Trading Cuantitativo es una estrategia de inversión que utiliza modelos matemáticos y algoritmos para tomar decisiones de trading. 
              Nuestros planes te permiten participar en estas estrategias, depositando tus fondos por un período fijo para recibir un retorno diario basado en el rendimiento de los algoritmos.
            </p>
          </Accordion>
        </div>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        <div className="mb-6">
          <IOSSegmentedControl
            options={periods}
            selected={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>

        {stockPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <IOSCard className="mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-ios-display font-semibold text-lg">
                    {pkg.name}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Duración: {pkg.duration}
                  </p>
                </div>
                <div className="bg-ios-green/10 px-3 py-1 rounded-full">
                  <span className="text-ios-green text-sm font-semibold">
                    +{pkg.dailyReturn}% diario
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Inversión mínima</span>
                  <span className="text-text-primary font-medium">
                    ${pkg.minAmount}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Inversión máxima</span>
                  <span className="text-text-primary font-medium">
                    ${pkg.maxAmount}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Retorno total</span>
                  <span className="text-ios-green font-medium">
                    {pkg.totalReturn}%
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Período de bloqueo</span>
                  <span className="text-text-primary font-medium">
                    {pkg.lockPeriod}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full mt-6 bg-ios-green text-white py-3 rounded-ios font-ios text-center"
                onClick={() => {/* Lógica de suscripción */}}
              >
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                {/* 3. Se unifica la terminología del botón. */}
                Comprar Plan
                {/* --- FIN DE LA MODIFICACIÓN --- */}
              </motion.button>
            </IOSCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuantitativePage;