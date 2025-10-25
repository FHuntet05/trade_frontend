// RUTA: frontend/src/pages/PurchasePlanPage.jsx
// --- INICIO DE LA NUEVA PÁGINA DE COMPRA DE PLAN ---

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useUserStore from '@/store/userStore';
import api from '@/api/axiosConfig';
import { IOSLayout, IOSBackButton, IOSButton, IOSCard } from '@/components/ui/IOSComponents';
import { Loader } from '@/components/common/Loader';
import { formatters } from '@/utils/formatters';

// Hook simple para debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const PurchasePlanPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [amount, setAmount] = useState('');
  const [calculatedGains, setCalculatedGains] = useState({ dailyGain: '0.00', totalReturn: '0.00' });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedAmount = useDebounce(amount, 500); // 500ms de delay

  // Efecto para obtener los detalles del plan
  useEffect(() => {
    const fetchPlanDetails = async () => {
      // NOTA: Asume que existe un endpoint GET /api/quantitative/plans/:id en el backend.
      try {
        const response = await api.get(`/api/quantitative/plans/${planId}`);
        if (response.data.success) {
          setPlan(response.data.data);
        } else {
          throw new Error('Plan no encontrado');
        }
      } catch (err) {
        setError('No se pudo cargar la información del plan. Por favor, vuelve a intentarlo.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanDetails();
  }, [planId]);

  // Efecto para calcular las ganancias cuando el monto (debounced) cambia
  useEffect(() => {
    const calculate = async () => {
      const numericAmount = parseFloat(debouncedAmount);
      if (!plan || !debouncedAmount || isNaN(numericAmount) || numericAmount <= 0) {
        setCalculatedGains({ dailyGain: '0.00', totalReturn: '0.00' });
        return;
      }
      setIsCalculating(true);
      try {
        const response = await api.post('/api/quantitative/calculate', { planId, amount: numericAmount });
        if (response.data.success) {
          setCalculatedGains(response.data.data);
        }
      } catch (err) {
        console.error("Error calculating gains:", err);
      } finally {
        setIsCalculating(false);
      }
    };
    calculate();
  }, [debouncedAmount, planId, plan]);

  const handleConfirmPurchase = async () => {
    const numericAmount = parseFloat(amount);
    if (isSubmitting || !plan || isNaN(numericAmount) || numericAmount < plan.minInvestment || numericAmount > plan.maxInvestment) {
      toast.error('Por favor, introduce un monto válido.');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Procesando tu compra...');

    try {
      const response = await api.post('/api/quantitative/initiate-purchase', { planId, amount: numericAmount });
      toast.dismiss();

      if (response.data.purchaseType === 'instant') {
        toast.success(response.data.message || '¡Compra realizada con éxito!');
        // Aquí podrías actualizar el userStore con el nuevo balance si lo deseas
        navigate('/home'); // Redirigir al dashboard
      } else if (response.data.purchaseType === 'deposit_required') {
        toast('Saldo insuficiente. Redirigiendo a depósito...', { icon: '⚠️' });
        const { ticketId } = response.data.data;
        navigate(`/deposit/pending/${ticketId}`); // Redirigir a la página de pago pendiente
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Ocurrió un error al procesar la compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="w-full h-screen flex justify-center items-center"><Loader /></div>;
  if (error) return <div className="w-full h-screen flex justify-center items-center text-red-500 p-4">{error}</div>;

  return (
    <IOSLayout>
      <div className="flex flex-col min-h-screen bg-system-background">
        <div className="flex items-center p-4 bg-internal-card border-b border-gray-200">
          <IOSBackButton onClick={() => navigate(-1)} />
          <h1 className="flex-1 text-center font-ios text-lg font-semibold">Confirmar Inversión</h1>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-4 space-y-6 pb-24">
          <IOSCard>
            <h2 className="text-xl font-ios-display font-bold text-text-primary">{plan.name}</h2>
            <p className="text-sm text-text-secondary">Duración: {plan.durationDays} días | Retorno Diario: {plan.dailyPercentage}%</p>
          </IOSCard>

          <IOSCard>
            <div className="mb-4">
              <label className="font-ios text-sm text-text-secondary ml-1 mb-2 block">Monto a Invertir (USDT)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Mín: ${plan.minInvestment} / Máx: ${plan.maxInvestment}`}
                className="w-full p-4 text-2xl font-ios-display bg-system-secondary border border-gray-300 rounded-ios focus:outline-none focus:ring-2 focus:ring-ios-green text-center"
              />
              <p className="text-xs text-text-tertiary mt-2 text-center">Tu saldo actual: {formatters.formatCurrency(user?.balance?.usdt || 0)}</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Ganancia diaria estimada</span>
                <span className="text-ios-green font-medium">
                  {isCalculating ? 'Calculando...' : `~ ${formatters.formatCurrency(calculatedGains.dailyGain)}`}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-text-secondary font-semibold">Retorno total estimado</span>
                <span className="text-ios-green font-bold">
                  {isCalculating ? 'Calculando...' : `~ ${formatters.formatCurrency(calculatedGains.totalReturn)}`}
                </span>
              </div>
            </div>
          </IOSCard>

          <IOSButton
            onClick={handleConfirmPurchase}
            disabled={isSubmitting || isCalculating}
            variant="primary"
            className="w-full"
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Compra'}
          </IOSButton>
        </motion.div>
      </div>
    </IOSLayout>
  );
};

export default PurchasePlanPage;

// --- FIN DE LA NUEVA PÁGINA DE COMPRA DE PLAN ---