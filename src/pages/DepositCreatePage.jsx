// RUTA: frontend/src/pages/DepositCreatePage.jsx
// Página para crear un nuevo ticket de depósito

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiInformationCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '@/api/axiosConfig';

const ICON_SOURCES = {
  USDT: '/assets/images/USDT.png',
  USDC: '/assets/images/USDT.png',
  BTC: '/assets/images/BTC.png',
  BITCOIN: '/assets/images/BTC.png',
  ETH: '/assets/images/ETH.png',
  ETHEREUM: '/assets/images/ETH.png',
  BNB: '/assets/images/BNB.png',
  BSC: '/assets/images/BNB.png',
  SOL: '/assets/images/SOL.png',
  SOLANA: '/assets/images/SOL.png',
  TRX: '/assets/images/TRON.png',
  TRON: '/assets/images/TRON.png',
  LTC: '/assets/images/litecoin.png',
  LITECOIN: '/assets/images/litecoin.png',
  TON: '/assets/images/TON.png',
  BEP20: '/assets/images/bep20-usdt.png',
};

const FALLBACK_ICON = ICON_SOURCES.BEP20;

const resolveMappedIcon = (key) => {
  if (!key) return null;
  const candidates = Array.isArray(key)
    ? key
    : [key];
  for (const candidate of candidates) {
    const normalized = candidate.toUpperCase();
    if (ICON_SOURCES[normalized]) {
      return ICON_SOURCES[normalized];
    }
    const collapsed = normalized.replace(/[^A-Z0-9]/g, '');
    if (ICON_SOURCES[collapsed]) {
      return ICON_SOURCES[collapsed];
    }
  }
  return null;
};

const getIconSource = (option) => {
  if (!option) return FALLBACK_ICON;

  const rawIcon = option.icon || option.currency || option.name;
  if (!rawIcon) return FALLBACK_ICON;

  const value = String(rawIcon).trim();
  if (!value) return FALLBACK_ICON;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return value;
  }

  if (/\.(png|jpg|jpeg|svg|webp)$/i.test(value)) {
    return value.startsWith('/') ? value : `/${value}`;
  }

  const mapped = resolveMappedIcon([
    value,
    value.replace(/\s+/g, ''),
    ...value.split(/[-_\s]+/),
  ]);

  if (mapped) {
    return mapped;
  }

  return FALLBACK_ICON;
};

const formatChainDescription = (option) => {
  if (!option) return '';
  if (option.type === 'automatic') {
    return `Red ${option.chain || 'BSC'} · Acreditación automática`;
  }
  if (option.isStaticWallet) {
    return `${option.chain || 'Método manual'} · Depósito manual`;
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
  const maxText = option.maxAmount && option.maxAmount > 0
    ? ` · Máximo ${option.maxAmount} ${option.currency}`
    : '';
  return `Mínimo ${min} USDT en ${option.currency}${maxText}`;
};

const getMethodDescription = (option) => {
  if (!option) return '';
  if (option.type === 'automatic') {
    return 'Los tickets automáticos expiran tras 30 minutos y se acreditan al confirmar la red blockchain.';
  }
  if (option.isStaticWallet) {
    return 'Envía únicamente el activo indicado y conserva tu comprobante por si soporte lo solicita.';
  }
  return 'Los depósitos manuales se acreditan cuando el equipo valida el comprobante enviado al soporte.';
};

const DepositCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const suggestedAmount = location.state?.requiredAmount || '';
  const reason = location.state?.reason || '';
  const pendingPurchaseId = location.state?.pendingPurchaseId || null;

  const [amount, setAmount] = useState(suggestedAmount ? String(suggestedAmount) : '');
  const [depositOptions, setDepositOptions] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollControls, setShowScrollControls] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const optionsScrollRef = useRef(null);

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

  useEffect(() => {
    const el = optionsScrollRef.current;
    if (!el) {
      setShowScrollControls(false);
      return;
    }

    const updateScrollState = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 8;
      setShowScrollControls(hasOverflow);
      if (hasOverflow) {
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
      } else {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    };

    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [depositOptions]);

  const scrollOptions = (offset) => {
    const el = optionsScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

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
        ...(pendingPurchaseId ? { pendingPurchaseId } : {}),
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
    const iconSrc = getIconSource(option);

    return (
      <motion.button
        key={option.key}
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setSelectedKey(option.key)}
        className={`group flex min-w-[96px] flex-shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-green/60 ${
          isActive
            ? 'border-ios-green/70 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-200'
            : 'border-transparent bg-white/0 text-gray-600 hover:border-ios-green/40 hover:bg-emerald-50/50 hover:text-emerald-700'
        }`}
      >
        <div className={`flex h-11 w-11 items-center justify-center rounded-full border bg-white ${
          isActive ? 'border-ios-green/80 shadow-inner shadow-emerald-100' : 'border-emerald-100 shadow-sm'
        }`}>
          <img src={iconSrc} alt={option.name} className="h-7 w-7 object-contain" loading="lazy" />
        </div>
        <span className={`font-ios text-xs font-semibold tracking-tight ${isActive ? 'text-emerald-700' : 'text-gray-600'}`}>
          {option.name}
        </span>
        <span className="font-ios text-[10px] text-gray-400 uppercase">{option.chain || option.currency}</span>
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
          <div className="relative mb-6 overflow-hidden rounded-3xl border border-ios-green/30 bg-gradient-to-br from-ios-green/15 via-transparent to-transparent p-[1px]">
            <div className="rounded-[22px] bg-system-background/95 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-ios-green/15 p-2 text-ios-green">
                  <HiInformationCircle size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-ios text-sm font-semibold uppercase tracking-wide text-ios-green">Motivo del depósito</p>
                  <p className="font-ios text-base font-medium text-text-primary">{reason}</p>
                </div>
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
            <div className="bg-internal-card rounded-ios-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-ios text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Selecciona un método
                </label>
                {showScrollControls && (
                  <div className="flex items-center gap-1 text-text-secondary">
                    <button
                      type="button"
                      onClick={() => scrollOptions(-160)}
                      disabled={!canScrollLeft}
                      className="rounded-full border border-white/10 bg-white/5 p-1 transition hover:bg-white/10 disabled:opacity-40"
                    >
                      <HiChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollOptions(160)}
                      disabled={!canScrollRight}
                      className="rounded-full border border-white/10 bg-white/5 p-1 transition hover:bg-white/10 disabled:opacity-40"
                    >
                      <HiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="rounded-[26px] border border-ios-green/60 bg-white/95 px-1.5 py-2.5">
                  <div
                    ref={optionsScrollRef}
                    className="flex items-stretch gap-2 overflow-x-auto overflow-y-hidden px-1.5 pb-1" style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {depositOptions.map(renderOptionButton)}
                  </div>
                </div>
                {showScrollControls && canScrollRight && (
                  <div className="pointer-events-none absolute inset-y-2 right-3 w-10 rounded-[20px] bg-gradient-to-l from-white to-transparent opacity-80" />
                )}
              </div>
            </div>

            {selectedOption && (
              <div className="bg-internal-card rounded-ios-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white ring-2 ring-ios-green/60">
                    <img
                      src={getIconSource(selectedOption)}
                      alt={selectedOption.name}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                    />
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

                {selectedOption.instructions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-ios-card p-3 text-yellow-900">
                    <div className="flex items-start gap-3">
                      <HiInformationCircle className="text-yellow-500 flex-shrink-0" size={22} />
                      <p className="font-ios text-xs whitespace-pre-line">
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
