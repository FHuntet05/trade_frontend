// RUTA: admin-frontend/src/pages/admin/PendingWithdrawalsPage.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Componente nuevo, diseñado para consumir el endpoint de agregación del backend.

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

// --- Componentes Reutilizables y de UI ---
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import WithdrawalsTable from './components/WithdrawalsTable';
import ProcessWithdrawalModal from './components/ProcessWithdrawalModal';
import { QuestionIcon } from '@/components/icons/AppIcons';

const PendingWithdrawalsPage = () => {
    // --- Estado de la Página ---
    const [withdrawalsData, setWithdrawalsData] = useState({ withdrawals: [], pages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    
    // --- Estado para el Modal de Procesamiento ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null); // Contiene el retiro a procesar
    const [actionType, setActionType] = useState(null); // Puede ser 'completed' o 'rejected'

    // --- Hooks para Paginación ---
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;

    // --- Carga de Datos ---
    const fetchWithdrawals = useCallback(async (page) => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/admin/withdrawals/pending', { params: { page, limit: 10 } });
            setWithdrawalsData(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "No se pudieron cargar los retiros pendientes.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWithdrawals(currentPage);
    }, [currentPage, fetchWithdrawals]);

    // --- Handlers de Interacción ---
    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };

    const openProcessModal = (withdrawal, type) => {
        setSelectedWithdrawal(withdrawal);
        setActionType(type);
        setIsModalOpen(true);
    };

    const closeProcessModal = () => {
        setSelectedWithdrawal(null);
        setActionType(null);
        setIsModalOpen(false);
    };

    // --- Lógica de la API para Procesar Retiros ---
    const handleProcessWithdrawal = async (details) => {
        const { status, adminNotes } = details;
        
        const promise = api.put(`/admin/withdrawals/${selectedWithdrawal._id}/process`, {
            status,
            adminNotes
        });

        toast.promise(promise, {
            loading: 'Procesando solicitud...',
            success: (res) => {
                closeProcessModal();
                // Si la página actual queda vacía, retrocedemos una página
                if (withdrawalsData.withdrawals.length === 1 && currentPage > 1) {
                    handlePageChange(currentPage - 1);
                } else {
                    fetchWithdrawals(currentPage); // Recargar datos
                }
                return `Retiro marcado como ${status} con éxito.`;
            },
            error: (err) => err.response?.data?.message || 'Error al procesar el retiro.',
        });
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                        <QuestionIcon className="w-6 h-6" /> Retiros Pendientes
                    </h1>
                    <p className="text-text-secondary mt-1">Aprueba o rechaza las solicitudes de retiro de los usuarios.</p>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center p-10"><Loader /></div>
                ) : (
                    <div className="bg-dark-secondary rounded-lg border border-white/10">
                        <WithdrawalsTable 
                            withdrawals={withdrawalsData.withdrawals}
                            onApprove={(withdrawal) => openProcessModal(withdrawal, 'completed')}
                            onReject={(withdrawal) => openProcessModal(withdrawal, 'rejected')}
                        />
                        <div className="p-4">
                             <Pagination
                                currentPage={currentPage}
                                totalPages={withdrawalsData.pages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* --- Modal de Confirmación y Proceso --- */}
            {isModalOpen && (
                 <ProcessWithdrawalModal
                    isOpen={isModalOpen}
                    onClose={closeProcessModal}
                    onConfirm={handleProcessWithdrawal}
                    withdrawal={selectedWithdrawal}
                    actionType={actionType}
                />
            )}
        </>
    );
};

export default PendingWithdrawalsPage;