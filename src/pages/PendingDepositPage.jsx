// RUTA: frontend/src/pages/PendingDepositPage.jsx
// --- INICIO DE LA NUEVA PÁGINA DE DEPÓSITO PENDIENTE ---

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import useCountdown from '@/hooks/useCountdown';
import api from '@/api/axiosConfig';
import { IOSLayout, IOSBackButton, IOSButton, IOSCard } from '@/components/ui/IOSComponents';
import  Loader  from '@/components/common/Loader';
import { FiCopy } from 'react-icons/fi';

const PendingDepositPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { timeLeft, isFinished } = useCountdown(ticket?.expiresAt);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      // NOTA: Asume un nuevo endpoint GET /api/user/pending-purchase/:ticketId
      try {
        const response = await api.get(`/api/user/pending-purchase/${ticketId}`);
        if (response.data.success) {
          setTicket(response.data.data);
        } else {
          throw new Error('Ticket no encontrado');
        }
      } catch (err) {
        setError('No se pudo cargar la información del ticket. Puede que haya expirado o no sea válido.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicketDetails();
  }, [ticketId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const handleManualConfirmation = async () => {
    setIsConfirming(true);
    toast.loading('Verificando pago...');
    try {
      // Llama al endpoint que ya existe para la confirmación manual
      const response = await api.post(`/api/quantitative/confirm-manual/${ticketId}`);
      toast.dismiss();
      toast.success(response.data.message || '¡Pago verificado y compra completada!');
      navigate('/home');
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'No se pudo confirmar el pago. Asegúrate de tener saldo suficiente.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) return <div className="w-full h-screen flex justify-center items-center"><Loader /></div>;
  if (error) return <div className="w-full h-screen flex flex-col justify-center items-center text-center p-4"><p className='text-red-500'>{error}</p><IOSButton className="mt-4" onClick={() => navigate('/home')}>Volver al Inicio</IOSButton></div>;

  return (
    <IOSLayout>
      <div className="flex flex-col min-h-screen bg-system-background">
        <div className="flex items-center p-4 bg-internal-card border-b border-gray-200">
          <IOSBackButton onClick={() => navigate('/quantitative')} />
          <h1 className="flex-1 text-center font-ios text-lg font-semibold">Completar Pago</h1>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-4 space-y-4 pb-24">
          <div className="text-center p-4 bg-yellow-100/80 text-yellow-800 rounded-ios">
            <h2 className="font-bold">Orden de Pago Pendiente</h2>
            <p className="text-sm">Para activar tu plan de inversión, envía la cantidad exacta a la dirección indicada.</p>
          </div>

          <IOSCard className="text-center">
            <p className="text-sm text-text-secondary">Monto a Enviar</p>
            <div className="flex items-center justify-center gap-2 my-2">
              <p className="text-3xl font-ios-display font-bold text-text-primary">{ticket.amount.toFixed(2)}</p>
              <span className="text-lg text-text-secondary">USDT</span>
            </div>
            <p className="text-xs text-text-tertiary">(Red BEP20)</p>
          </IOSCard>

          <IOSCard className="flex flex-col items-center">
            <p className="text-sm text-text-secondary mb-4">Escanea o copia la dirección de depósito</p>
            <div className="p-2 bg-white rounded-lg">
              <QRCode value={ticket.depositAddress} size={160} />
            </div>
            <div 
              className="mt-4 p-3 bg-system-secondary rounded-ios w-full text-center font-mono text-sm break-all cursor-pointer flex items-center justify-between"
              onClick={() => handleCopy(ticket.depositAddress)}
            >
              {ticket.depositAddress}
              <FiCopy className="ml-2 flex-shrink-0" />
            </div>
          </IOSCard>
          
          <div className={`text-center p-3 rounded-ios ${isFinished ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            <p className="text-sm font-semibold">{isFinished ? 'La orden ha expirado' : `Tiempo restante: ${timeLeft}`}</p>
          </div>

          <IOSButton
            onClick={handleManualConfirmation}
            disabled={isConfirming || isFinished}
            variant="primary"
            className="w-full"
          >
            {isConfirming ? 'Verificando...' : 'He Realizado el Pago'}
          </IOSButton>
        </motion.div>
      </div>
    </IOSLayout>
  );
};

export default PendingDepositPage;
// --- FIN DE LA NUEVA PÁGINA DE DEPÓSITO PENDIENTE ---