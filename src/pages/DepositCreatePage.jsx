// RUTA: frontend/src/pages/DepositCreatePage.jsx
// Página para crear un nuevo ticket de depósito

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiInformationCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '@/api/axiosConfig';

const DepositCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const suggestedAmount = location.state?.requiredAmount || '';
  const reason = location.state?.reason || '';

  const [amount, setAmount] = useState(suggestedAmount ? String(suggestedAmount) : '');
  const [depositOptions, setDepositOptions] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOption = useMemo(
    () => depositOptions.find((option) => option.key === selectedKey) || null,
    [depositOptions, selectedKey]
  );

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const response = await api.get('/payment/deposit-options');
        const options = response.data || [];
        setDepositOptions(options);
        if (options.length > 0) {
          setSelectedKey(options[0].key);
          const min = options[0].minAmount && options[0].minAmount > 0 ? options[0].minAmount : 0.01;
          if (!suggestedAmount || suggestedAmount < min) {
            setAmount(String(min));
          }
        }
      } catch (error) {
        const message = error.response?.data?.message || 'No se pudieron cargar las opciones de depósito.';
        toast.error(message);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [suggestedAmount]);

  useEffect(() => {
    if (!selectedOption) return;
    const min = selectedOption.minAmount && selectedOption.minAmount > 0 ? selectedOption.minAmount : 0.01;
    if (!amount || Number(amount) < min) {
      setAmount(String(min));
    }
  }, [selectedOption]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedOption) {
      toast.error('Selecciona un método de depósito.');
      return;
    }

    const min = selectedOption.minAmount && selectedOption.minAmount > 0 ? selectedOption.minAmount : 0.01;
    if (!amount || Number(amount) < min) {
      toast.error(`El monto mínimo para este método es ${min} ${selectedOption.currency}.`);
      return;
    }

    if (selectedOption.maxAmount && selectedOption.maxAmount > 0 && Number(amount) > selectedOption.maxAmount) {
      toast.error(`El monto máximo para este método es ${selectedOption.maxAmount} ${selectedOption.currency}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/deposits/create-ticket', {
        amount: Number(amount),
        methodKey: selectedOption.key,
      });

      if (response.data.success) {
        const ticketId = response.data.data.ticketId;
        toast.success('Ticket de depósito creado');
        navigate(`/deposit/pending/${ticketId}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear el ticket de depósito';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOptionButton = (option) => {
    const isActive = option.key === selectedKey;
    const minAmount = option.minAmount && option.minAmount > 0 ? option.minAmount : 0.01;

    return (
      <motion.button
        key={option.key}
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedKey(option.key)}
        className={`flex flex-col items-start gap-1 p-4 rounded-ios-xl border transition-all ${
          isActive ? 'border-ios-green bg-ios-green/10 text-white' : 'border-transparent bg-system-secondary text-text-primary'
        }`}
      >
        <span className="font-ios font-semibold text-base">{option.name}</span>
        <span className="font-ios text-xs text-text-secondary">
          {option.currency} · {option.chain || 'Método manual'}
        </span>
        <span className="font-ios text-xs text-text-secondary">
          Mínimo: {minAmount} {option.currency}
          {option.maxAmount > 0 ? ` · Máximo: ${option.maxAmount} ${option.currency}` : ''}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-system-background pb-24">
      <div className="p-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-text-primary">
            <HiChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-ios-display font-bold text-text-primary">
            Depositar Fondos
          </h1>
          <div className="w-7"></div>
        </div>

        {reason && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-ios-card p-4 mb-6">
            <div className="flex items-start gap-3">
              <HiInformationCircle className="text-blue-400 flex-shrink-0" size={24} />
              <div>
                <p className="font-ios text-sm text-blue-300 font-semibold mb-1">Motivo del depósito</p>
                <p className="font-ios text-sm text-blue-200">{reason}</p>
              </div>
            </div>
          </div>
        )}

        {isLoadingOptions ? (
          <div className="bg-internal-card rounded-ios-xl p-6 text-center text-text-secondary">
            Cargando métodos disponibles...
          </div>
        ) : depositOptions.length === 0 ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-ios-xl p-4 text-red-200 text-sm">
            No hay métodos de depósito disponibles en este momento.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-internal-card rounded-ios-xl p-4 space-y-4">
              <label className="font-ios text-sm text-text-secondary block">
                Selecciona un método
              </label>
              <div className="space-y-3">
                {depositOptions.map(renderOptionButton)}
              </div>
            </div>

            {selectedOption && (
              <div className="bg-internal-card rounded-ios-xl p-4 space-y-4">
                <div>
                  <label className="font-ios text-sm text-text-secondary mb-2 block">
                    Monto a Depositar ({selectedOption.currency})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    step="0.01"
                    min={selectedOption.minAmount && selectedOption.minAmount > 0 ? selectedOption.minAmount : 0.01}
                    placeholder="Ingresa el monto"
                    className="w-full bg-system-secondary p-3 rounded-ios-button text-text-primary font-ios text-lg focus:outline-none focus:ring-2 focus:ring-ios-green"
                    required
                  />
                  <p className="font-ios text-xs text-text-secondary mt-2">
                    Mínimo {selectedOption.minAmount && selectedOption.minAmount > 0 ? selectedOption.minAmount : 0.01} {selectedOption.currency}
                    {selectedOption.maxAmount > 0 ? ` · Máximo ${selectedOption.maxAmount} ${selectedOption.currency}` : ''}
                  </p>
                </div>

                <p className="font-ios text-xs text-text-secondary">
                  {selectedOption.type === 'automatic'
                    ? 'Los tickets automáticos expiran tras 30 minutos y se acreditan al detectar la transacción en blockchain.'
                    : 'Los depósitos manuales se acreditan cuando el equipo valida el comprobante enviado al soporte.'}
                </p>

                {selectedOption.instructions && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-ios-card p-3">
                    <div className="flex items-start gap-3">
                      <HiInformationCircle className="text-yellow-400 flex-shrink-0" size={22} />
                      <p className="font-ios text-xs text-yellow-200 whitespace-pre-line">
                        {selectedOption.instructions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || !selectedOption}
              className="w-full bg-ios-green text-white py-4 rounded-ios-button font-ios font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando ticket...' : 'Generar Ticket de Depósito'}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DepositCreatePage;
