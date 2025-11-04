// RUTA: frontend/src/pages/PendingDepositPage.jsx
// --- VERSIÓN ACTUALIZADA CON REACCIÓN AL ESTADO 'COMPLETED' ---

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// import toast from 'react-hot-toast'; // Se elimina la importación de toast
import useCountdown from '@/hooks/useCountdown';
import api from '@/api/axiosConfig';
import { IOSLayout, IOSBackButton, IOSButton, IOSCard } from '@/components/ui/IOSComponents';
import Loader from '@/components/common/Loader';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';

const QRCode = lazy(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeCanvas })));

const PendingDepositPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { timeLeft, isFinished } = useCountdown(ticket?.expiresAt);
  const isStaticWalletTicket = Boolean(ticket?.metadata?.staticWalletKey);

  // --- INICIO DE LA MODIFICACIÓN ---
  // Guardamos si la compra se ha completado para evitar que el sondeo lo revierta
  const [isPurchaseCompleted, setIsPurchaseCompleted] = useState(false);
  // --- FIN DE LA MODIFICACIÓN ---

  useEffect(() => {
    let intervalId;

    const fetchTicketDetails = async () => {
      // Si la compra ya se marcó como completa, detenemos el sondeo.
      if (isPurchaseCompleted) {
        clearInterval(intervalId);
        return;
      }

      try {
        const response = await api.get(`/deposits/ticket/${ticketId}`);
        if (response.data.success) {
          const fetchedTicket = response.data.data;
          setTicket(fetchedTicket);

          // Lógica CRÍTICA: Si el backend nos dice que el ticket está 'completed',
          // actualizamos nuestro estado local para reflejarlo permanentemente.
          if (fetchedTicket.status === 'completed') {
            setIsPurchaseCompleted(true);
            clearInterval(intervalId); // Detenemos futuras llamadas a la API
          }
        } else {
          throw new Error('Ticket no encontrado');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No se pudo cargar la información del ticket. Puede que haya expirado o no sea válido.');
        } else {
          setError('Error al obtener la información del ticket. Intenta nuevamente.');
        }
        clearInterval(intervalId);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
    intervalId = setInterval(fetchTicketDetails, 10000);

    return () => clearInterval(intervalId);
  }, [ticketId, isPurchaseCompleted]); // Se añade 'isPurchaseCompleted' a las dependencias

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Ya no se muestra un toast. El usuario puede confiar en que la copia funciona.
  };

  if (isLoading) return <div className="w-full h-screen flex justify-center items-center"><Loader /></div>;
  if (error) return <div className="w-full h-screen flex flex-col justify-center items-center text-center p-4"><p className='text-red-500'>{error}</p><IOSButton className="mt-4" onClick={() => navigate('/home')}>Volver al Inicio</IOSButton></div>;

  const isAutomatic = ticket.methodType === 'automatic';
  const showCountdown = isAutomatic && Boolean(ticket.expiresAt);

  // --- INICIO DE LA MODIFICACIÓN (Renderizado Condicional) ---
  // Si la compra/depósito se completó, mostramos una pantalla de éxito.
  if (isPurchaseCompleted || ticket?.status === 'completed') {
    return (
      <IOSLayout>
        <div className="flex flex-col min-h-screen bg-system-background p-4 justify-center items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <IOSCard className="p-8">
              <div className="w-20 h-20 bg-green-100 text-ios-green rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle size={40} />
              </div>
              <h1 className="font-ios-display font-bold text-2xl text-text-primary">
                {ticket.metadata.context === 'quantitative_purchase' ? 'Inversión Activada' : 'Depósito Confirmado'}
              </h1>
              <p className="text-text-secondary mt-2 mb-6">
                {ticket.metadata.context === 'quantitative_purchase'
                  ? 'Tu plan de inversión ya está activo y generando ganancias. Puedes ver los detalles en tu historial.'
                  : 'Tus fondos han sido acreditados a tu saldo principal.'
                }
              </p>
              <IOSButton variant="primary" onClick={() => navigate('/home')} className="w-full">
                Volver al Inicio
              </IOSButton>
            </IOSCard>
          </motion.div>
        </div>
      </IOSLayout>
    );
  }
  // --- FIN DE LA MODIFICACIÓN (Renderizado Condicional) ---

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
                : 'Sigue las instrucciones para completar tu depósito.'}
            </p>
          </div>

          <IOSCard className="text-center">
            <p className="text-sm text-text-secondary">Monto a Enviar</p>
            <div className="flex items-center justify-center gap-2 my-2">
              <p className="text-3xl font-ios-display font-bold text-text-primary">{Number(ticket.amount).toFixed(2)}</p>
              <span className="text-lg text-text-secondary">{ticket.currency}</span>
            </div>
            {ticket.chain && (<p className="text-xs text-text-tertiary">Red: {ticket.chain}</p>)}
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
                Este ticket usa una billetera fija. Verifica la red ({ticket.chain || 'especificada'}) y guarda tu comprobante.
              </p>
            </IOSCard>
          )}

          {ticket.instructions && (
            <IOSCard className="bg-yellow-50 border border-yellow-200 text-yellow-900">
              <p className="text-sm font-semibold mb-2">Instrucciones</p>
              <p className="text-xs whitespace-pre-line text-left">{ticket.instructions}</p>
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

        </motion.div>
      </div>
    </IOSLayout>
  );
};

export default PendingDepositPage;