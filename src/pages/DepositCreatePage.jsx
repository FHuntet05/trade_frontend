// RUTA: frontend/src/pages/DepositCreatePage.jsx
// Página para crear un nuevo ticket de depósito

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiInformationCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '@/api/axiosConfig';
import { CryptoIcon } from '@/components/icons/CryptoIcons';

const gradientByCurrency = {
  USDT: 'from-emerald-500/80 via-emerald-400/60 to-emerald-500/30',
  BTC: 'from-amber-500/80 via-orange-500/60 to-amber-500/30',
  ETH: 'from-indigo-500/80 via-purple-500/60 to-indigo-500/30',
  LTC: 'from-slate-400/80 via-slate-300/60 to-slate-400/30',
  TRX: 'from-rose-500/80 via-red-500/60 to-rose-500/30',
  SOL: 'from-cyan-500/80 via-teal-400/60 to-cyan-500/30',
  TON: 'from-sky-500/80 via-blue-400/60 to-sky-500/30',
  BNB: 'from-yellow-500/80 via-orange-400/60 to-yellow-500/30',
  DEFAULT: 'from-cyan-500/70 via-slate-500/40 to-cyan-500/20',
};

const methodBadges = {
  automatic: {
    label: 'Automático',
    className: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
  },
  manual: {
    label: 'Manual',
    className: 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
  },
  static: {
    label: 'Wallet fija',
    className: 'bg-blue-500/20 text-blue-200 border border-blue-400/40'
  }
};

const getGradientClass = (symbol) => gradientByCurrency[symbol?.toUpperCase()] || gradientByCurrency.DEFAULT;

const getMethodBadge = (option) => {
  if (!option) return methodBadges.manual;
  if (option.type === 'automatic') return methodBadges.automatic;
  if (option.isStaticWallet) return methodBadges.static;
  return methodBadges.manual;
};

const formatChainDescription = (option) => {
  if (!option) return '';
  if (option.type === 'automatic') {
    return `Red ${option.chain || 'BSC'} · Acreditación automática`;
  }
  if (option.isStaticWallet) {
    return `${option.chain || 'Método manual'} · Billetera fija administrada por soporte`;
  }
  if (option.chain) {
    return `${option.chain} · Confirmación manual`;
  }
  return 'Confirmación manual del equipo';
};

const getMinAmount = (option) => {
  if (!option) return 0.01;
  return option.minAmount && option.minAmount > 0 ? option.minAmount : 0.01;
};

const formatLimitsText = (option) => {
  if (!option) return '';
  const min = getMinAmount(option);
  const maxText = option.maxAmount && option.maxAmount > 0 ? ` · Máximo ${option.maxAmount} ${option.currency}` : '';
  return `Mínimo ${min} ${option.currency}${maxText}`;
};

const getMethodDescription = (option) => {
  if (!option) return '';
  if (option.type === 'automatic') {
    return 'Los tickets automáticos expiran tras 30 minutos y se acreditan al confirmar la red blockchain.';
  }
  if (option.isStaticWallet) {
    return 'Este método usa una billetera fija configurada por el equipo. Envía únicamente el activo indicado y conserva tu comprobante por si soporte lo solicita.';
  }
  return 'Los depósitos manuales se acreditan cuando el equipo valida el comprobante enviado al soporte.';
};

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
    const badge = getMethodBadge(option);
    const gradient = getGradientClass(option.icon || option.currency);

    return (
      <motion.button
        key={option.key}
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setSelectedKey(option.key)}
        className={`relative flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all duration-200 ${
          isActive
            ? 'border-ios-green/70 bg-white/10 shadow-lg shadow-emerald-500/25 text-white'
            : 'border-white/10 bg-system-secondary/50 text-text-primary hover:border-white/25 hover:bg-system-secondary/70'
        }`}
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
          <CryptoIcon symbol={option.icon || option.currency} className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-ios font-semibold text-sm">{option.name}</span>
            <span className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <p className="font-ios text-xs text-text-secondary mt-1">
            {formatChainDescription(option)}
          </p>
          <p className="font-ios text-[11px] text-text-tertiary mt-1">{formatLimitsText(option)}</p>
        </div>
        {isActive && (
          <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-ios-green/60" />
        )}
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
              <div className="bg-internal-card rounded-ios-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${getGradientClass(selectedOption.icon || selectedOption.currency)}`}>
                    <CryptoIcon symbol={selectedOption.icon || selectedOption.currency} className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-ios font-semibold text-lg text-white">{selectedOption.name}</h2>
                    <p className="font-ios text-xs text-text-secondary mt-1">{formatChainDescription(selectedOption)}</p>
                    <p className="font-ios text-[11px] text-text-tertiary mt-1">{formatLimitsText(selectedOption)}</p>
                  </div>
                </div>

                <div>
                  <label className="font-ios text-sm text-text-secondary mb-2 block">
                    Monto a Depositar ({selectedOption.currency})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    step="0.01"
                    min={getMinAmount(selectedOption)}
                    placeholder="Ingresa el monto"
                    className="w-full bg-system-secondary p-3 rounded-ios-button text-text-primary font-ios text-lg focus:outline-none focus:ring-2 focus:ring-ios-green"
                    required
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-ios text-[11px] text-text-secondary mt-2">
                    <span>{formatLimitsText(selectedOption)}</span>
                    <span className="uppercase tracking-wide text-text-tertiary">Moneda: {selectedOption.currency}</span>
                  </div>
                </div>

                <div className="bg-system-secondary/60 border border-white/10 rounded-ios-card p-3">
                  <div className="flex items-start gap-3">
                    <HiInformationCircle className="text-ios-green flex-shrink-0" size={22} />
                    <p className="font-ios text-xs text-text-secondary">
                      {getMethodDescription(selectedOption)}
                    </p>
                  </div>
                </div>

                {selectedOption.isStaticWallet && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-ios-card p-3">
                    <p className="font-ios text-xs text-blue-200">
                      La dirección de depósito proviene de la billetera fija configurada en ajustes de administrador. Verifica la red indicada antes de enviar y guarda tu comprobante.
                    </p>
                  </div>
                )}

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
