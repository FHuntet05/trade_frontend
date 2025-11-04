// RUTA: frontend/src/pages/admin/components/ProcessDepositModal.jsx
// --- VERSIÓN FINAL CON CORRECCIONES DE ID Y ESTILO ---

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import adminApi from '@/pages/admin/api/adminApi';

// --- CORRECCIÓN DE ESTILO: MODAL CON FONDO SÓLIDO ---
const Modal = ({ children, onClose }) => (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        onClick={onClose}
    >
        <div 
            className="bg-dark-secondary rounded-lg shadow-xl w-full max-w-lg border border-white/10"
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
);

const ProcessDepositModal = ({ isOpen, onClose, ticket, onSuccess }) => {
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
    
    useEffect(() => {
        if (ticket) {
            setValue('creditedAmount', Number(ticket.amount).toFixed(2));
            setValue('adminNotes', '');
        }
    }, [ticket, setValue]);

    if (!isOpen || !ticket) return null;

    // --- CORRECCIÓN CRÍTICA: ID INDEFINIDO (SOLUCIÓN DEFINITIVA) ---
    // Se crea una variable que busca `ticket.ticketId` primero, y si no existe, usa `ticket._id`.
    // Esto hace que el componente sea robusto ante cualquier estructura de datos del ticket.
    const validTicketId = ticket.ticketId || ticket._id;

    const processAction = async (status, data) => {
        if (!validTicketId) {
            toast.error("Error crítico: El ID del ticket no está disponible.");
            return;
        }

        const payload = {
            status,
            creditedAmount: Number(data.creditedAmount),
            adminNotes: data.adminNotes || ''
        };
        
        const promise = adminApi.post(`/admin/deposits/${validTicketId}/process-manual`, payload);

        toast.promise(promise, {
            loading: `Procesando...`,
            success: (res) => {
                onSuccess();
                return res.data.message || 'Operación completada.';
            },
            error: (err) => err.response?.data?.message || 'Ocurrió un error.'
        });
    };
    
    const onApprove = (data) => {
        if (Number(data.creditedAmount) <= 0) {
            toast.error('El monto acreditado debe ser mayor a cero.');
            return;
        }
        processAction('completed', data);
    };

    const onReject = (data) => {
        if (!data.adminNotes) {
            toast.error('Debes proporcionar un motivo para el rechazo.');
            return;
        }
        processAction('rejected', data);
    };

    return (
        <Modal onClose={onClose}>
            {/* --- CORRECCIÓN DE ESTILO: TEXTOS ADAPTADOS AL FONDO OSCURO --- */}
            <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">Revisar Depósito Manual</h2>
                <p className="text-sm text-text-secondary">Ticket ID: {validTicketId}</p>
            </div>

            <div className="p-6 border-y border-white/10 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-text-secondary">Usuario</p>
                        <p className="font-semibold text-white">{ticket.user?.username || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-text-secondary">Fecha de Solicitud</p>
                        <p className="font-semibold text-white">{new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-text-secondary">Método de Pago</p>
                        <p className="font-semibold text-white">{ticket.methodName} ({ticket.chain})</p>
                    </div>
                    <div>
                        <p className="text-text-secondary">Monto Solicitado</p>
                        <p className="font-semibold text-green-400">{Number(ticket.amount).toFixed(2)} {ticket.currency}</p>
                    </div>
                </div>
                 {ticket.instructions && (
                    <div className="bg-dark-tertiary p-3 rounded-md">
                        <p className="text-xs text-text-secondary whitespace-pre-line">{ticket.instructions}</p>
                    </div>
                 )}
            </div>
            
            <form>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="creditedAmount" className="block text-sm font-medium text-text-secondary mb-1">
                            Monto Recibido ({ticket.currency})
                        </label>
                        <input
                            id="creditedAmount"
                            type="number"
                            step="0.01"
                            {...register('creditedAmount', { required: "El monto es requerido.", valueAsNumber: true })}
                            className="w-full bg-dark-tertiary p-2 rounded-md border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.creditedAmount && <p className="text-red-400 text-xs mt-1">{errors.creditedAmount.message}</p>}
                        <p className="text-xs text-text-secondary mt-1">
                            Ajusta este valor. El sistema lo convertirá y acreditará en USDT.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="adminNotes" className="block text-sm font-medium text-text-secondary mb-1">
                            Notas del Administrador (Requerido para rechazar)
                        </label>
                        <textarea
                            id="adminNotes"
                            {...register('adminNotes')}
                            rows={2}
                            className="w-full bg-dark-tertiary p-2 rounded-md border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>
                </div>

                <div className="bg-dark-primary px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit(onReject)} 
                        disabled={isSubmitting} 
                        className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Procesando...' : 'Rechazar'}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit(onApprove)} 
                        disabled={isSubmitting} 
                        className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Procesando...' : 'Aprobar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ProcessDepositModal;