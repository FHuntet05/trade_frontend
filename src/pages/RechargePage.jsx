// src/pages/RechargePage.jsx
import React, { useState } from 'react';
import StaticPageLayout from '../components/layout/StaticPageLayout';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig'; // Asegúrate de que la ruta es correcta

const RechargePage = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateInvoice = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Por favor, introduce una cantidad válida.');
      return;
    }

    setLoading(true);
    try {
      // Este es el endpoint de recarga de saldo, no de compra
      // Tendremos que crearlo en el backend
      const response = await api.post('/wallet/create-deposit-invoice', { 
        amount: numericAmount,
        currency: 'USDT' // o la moneda base que prefieras
      });
      
      // La API de CryptoCloud nos da una URL de pago, la abrimos en una nueva pestaña
      if (response.data.paymentUrl) {
        window.open(response.data.paymentUrl, '_blank');
        toast.success('Factura de pago creada. Revisa la nueva pestaña.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la factura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
    <StaticPageLayout title="Recargar Saldo">
      <div className="space-y-6 text-center max-w-sm mx-auto">
        <p className="text-text-secondary">
          Introduce la cantidad de USDT que deseas añadir a tu saldo. Se generará una factura de pago.
        </p>
        
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej: 50"
            className="w-full bg-dark-secondary border border-white/10 rounded-lg p-4 text-center text-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">USDT</span>
        </div>

        <button
          onClick={handleCreateInvoice}
          disabled={loading}
          className="w-full py-3 font-bold text-white rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-purple-500/30 disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Crear Factura de Pago'}
        </button>
      </div>
    </StaticPageLayout>
    </div>
  );
};

export default RechargePage;