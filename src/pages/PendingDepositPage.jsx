// RUTA: frontend/src/pages/PendingDepositPage.jsx
// --- INICIO DE LA SOLUCIÓN DEFINITIVA CON IMPORTACIÓN DINÁMICA ---

import React, { useState, useEffect, lazy, Suspense } from 'react'; // 1. Se añaden 'lazy' y 'Suspense' de React.
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
// 2. La importación 'import { QRCode } from 'qrcode.react';' SE ELIMINA de aquí.
import useCountdown from '@/hooks/useCountdown';
import api from '@/api/axiosConfig';
import { IOSLayout, IOSBackButton, IOSButton, IOSCard } from '@/components/ui/IOSComponents';
import Loader from '@/components/common/Loader';
import { FiCopy } from 'react-icons/fi';

// 3. Se define el componente QRCode para que se cargue de forma "perezosa" (lazy).
//    React no cargará el código de esta librería hasta que sea estrictamente necesario.
const QRCode = lazy(async () => {
  const mod = await import('qrcode.react');
  const component =
    mod.QRCodeCanvas ||
    mod.QRCodeSVG ||
    mod.default?.QRCodeCanvas ||
    mod.default?.QRCodeSVG ||
    mod.default;

  if (!component) {
    throw new Error('No se encontró el componente QRCode en qrcode.react');
  }

  return { default: component };
});

const PendingDepositPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { timeLeft, isFinished } = useCountdown(ticket?.expiresAt);
  const isStaticWalletTicket = Boolean(ticket?.metadata?.staticWalletKey);

  useEffect(() => {
    let intervalId;

    const fetchTicketDetails = async () => {
      try {
        const response = await api.get(`/deposits/ticket/${ticketId}`);
        if (response.data.success) {
          setTicket(response.data.data);
        } else {
          throw new Error('Ticket no encontrado');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No se pudo cargar la información del ticket. Puede que haya expirado o no sea válido.');
          clearInterval(intervalId);
        } else {
          setError('Error al obtener la información del ticket. Intenta nuevamente.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
    intervalId = setInterval(fetchTicketDetails, 10000); // refrescar cada 10s

    return () => clearInterval(intervalId);
  }, [ticketId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const handleManualConfirmation = () => {
    if (!ticket) return;
    if (ticket.methodType === 'manual') {
      toast('Nuestro equipo revisará tu comprobante y acreditará el depósito manualmente.', {
        icon: '🧾'
      });
    } else {
      toast('Estamos verificando la transacción en la blockchain. Se actualizará automáticamente al confirmarse.', {
        icon: '⏳'
      });
    }
  };

  if (isLoading) return <div className="w-full h-screen flex justify-center items-center"><Loader /></div>;
  if (error) return <div className="w-full h-screen flex flex-col justify-center items-center text-center p-4"><p className='text-red-500'>{error}</p><IOSButton className="mt-4" onClick={() => navigate('/home')}>Volver al Inicio</IOSButton></div>;

  const isAutomatic = ticket.methodType === 'automatic';
  const showCountdown = isAutomatic && Boolean(ticket.expiresAt);

  return (
    <IOSLayout>
      <div className="flex flex-col min-h-screen bg-system-background">
        <div className="flex items-center p-4 bg-internal-card border-b border-gray-200">
          <IOSBackButton onClick={() => navigate('/quantitative')} />
          <h1 className="flex-1 text-center font-ios text-lg font-semibold">Completar Pago</h1>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-4 space-y-4 pb-24">
          <div className="text-center p-4 bg-yellow-100/80 text-yellow-800 rounded-ios">
            <h2 className="font-bold">Ticket de Depósito ({ticket.methodName})</h2>
            <p className="text-sm">
              {isAutomatic
                ? 'Envía la cantidad indicada a la dirección asignada antes de que el ticket expire.'
                : 'Sigue las instrucciones para completar tu depósito. Una vez enviado, envia el comprobante al soporte si es necesario.'}
            </p>
          </div>

          <IOSCard className="text-center">
            <p className="text-sm text-text-secondary">Monto a Enviar</p>
            <div className="flex items-center justify-center gap-2 my-2">
              <p className="text-3xl font-ios-display font-bold text-text-primary">{Number(ticket.amount).toFixed(2)}</p>
              <span className="text-lg text-text-secondary">{ticket.currency}</span>
            </div>
            {ticket.chain && (
              <p className="text-xs text-text-tertiary">Red: {ticket.chain}</p>
            )}
          </IOSCard>

          {ticket.depositAddress && (
            <IOSCard className="flex flex-col items-center">
              <p className="text-sm text-text-secondary mb-4">{isAutomatic ? 'Escanea o copia la dirección de depósito' : 'Dirección para tu depósito'}</p>
              <div className="p-2 bg-white rounded-lg">
                <Suspense fallback={<div style={{ width: 160, height: 160, backgroundColor: '#f0f0f0', borderRadius: '8px' }} />}>
                  <QRCode value={ticket.depositAddress} size={160} />
                </Suspense>
              </div>
              <div 
                className="mt-4 p-3 bg-system-secondary rounded-ios w-full text-center font-mono text-sm break-all cursor-pointer flex items-center justify-between"
                onClick={() => handleCopy(ticket.depositAddress)}
              >
                {ticket.depositAddress}
                <FiCopy className="ml-2 flex-shrink-0" />
              </div>
            </IOSCard>
          )}

          {isStaticWalletTicket && (
            <IOSCard className="bg-blue-50 border border-blue-200 text-blue-900">
              <p className="text-xs font-semibold mb-1">Billetera fija</p>
              <p className="text-xs">
                Este ticket usa una billetera fija configurada por el equipo para {ticket.currency}. Verifica la red indicada ({ticket.chain || 'red especificada'}) y guarda tu comprobante para soporte.
              </p>
            </IOSCard>
          )}

          {ticket.instructions && (
            <IOSCard className="bg-yellow-50 border border-yellow-200 text-yellow-900">
              <p className="text-sm font-semibold mb-2">Instrucciones</p>
              <p className="text-xs whitespace-pre-line text-left">
                {ticket.instructions}
              </p>
            </IOSCard>
          )}
          
          {showCountdown ? (
            <div className={`text-center p-3 rounded-ios ${isFinished ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              <p className="text-sm font-semibold">{isFinished ? 'La orden ha expirado' : `Tiempo restante: ${timeLeft}`}</p>
            </div>
          ) : (
            <div className="text-center p-3 rounded-ios bg-blue-100 text-blue-700">
              <p className="text-sm font-semibold">Este ticket no tiene expiración automática.</p>
            </div>
          )}

          <IOSButton
            onClick={handleManualConfirmation}
            disabled={isAutomatic && isFinished}
            variant="primary"
            className="w-full"
          >
            He realizado el pago
          </IOSButton>
        </motion.div>
      </div>
    </IOSLayout>
  );
};

export default PendingDepositPage;