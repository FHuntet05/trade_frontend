// RUTA: frontend/src/pages/admin/AdminToolsPage.jsx (VERSIÓN "NEXUS" INTEGRADA)
// ARQUITECTURA: Página de gestión de Fábricas/VIPs, validada y robustecida.

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
// [NEXUS VALIDATION] La ruta de importación de la API es correcta.
import api from '../../api/axiosConfig'; 
import toast from 'react-hot-toast';

// --- Componentes Reutilizables y de UI ---
import Loader from '../../components/common/Loader';
import ToolFormModal from './components/ToolFormModal';
import ToolsTable from './components/ToolsTable';
import { HiOutlineWrenchScrewdriver, HiPlus } from 'react-icons/hi2';

const AdminToolsPage = () => {
    // [NEXUS VALIDATION] El estado inicial como array vacío [] es la práctica correcta para prevenir errores de renderizado.
    const [tools, setTools] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState(null);

    const fetchTools = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/admin/factories');
            
            // [NEXUS INTEGRATION] Se añade una capa de validación.
            // Esto protege el componente si la API alguna vez devuelve algo que no sea un array.
            if (Array.isArray(data)) {
                setTools(data);
            } else {
                console.error("Respuesta inesperada de la API, se esperaba un array:", data);
                toast.error('Error: Formato de datos incorrecto desde el servidor.');
                setTools([]); // Aseguramos que el estado siga siendo un array vacío.
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al cargar las fábricas.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTools();
    }, [fetchTools]);

    const handleOpenModal = (tool = null) => {
        setEditingTool(tool);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTool(null);
        setIsModalOpen(false);
    };

    const handleSaveTool = async (formData, toolId) => {
        const isEditing = !!toolId;
        const request = isEditing 
            ? api.put(`/admin/factories/${toolId}`, formData)
            : api.post('/admin/factories', formData);

        toast.promise(request, {
            loading: 'Guardando datos...',
            success: () => {
                handleCloseModal();
                fetchTools();
                return `Fábrica ${isEditing ? 'actualizada' : 'creada'} correctamente.`;
            },
            error: (err) => err.response?.data?.message || 'Error al guardar los datos.',
        });
    };

    const handleDeleteTool = async (toolId) => {
        if (window.confirm('¿Seguro que quieres eliminar esta fábrica? Esta acción es irreversible.')) {
            const promise = api.delete(`/admin/factories/${toolId}`);
            toast.promise(promise, {
                loading: 'Eliminando fábrica...',
                success: () => {
                    fetchTools();
                    return 'Fábrica eliminada con éxito.';
                },
                error: (err) => err.response?.data?.message || 'No se pudo eliminar la fábrica.',
            });
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex-grow">
                        <h1 className="text-2xl font-semibold flex items-center gap-3">
                            <HiOutlineWrenchScrewdriver /> Gestión de Fábricas (VIP)
                        </h1>
                        <p className="text-text-secondary mt-1">Crea, edita y elimina los niveles de inversión disponibles para los usuarios.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="flex items-center gap-2 px-4 py-2 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto"
                    >
                        <HiPlus className="w-5 h-5" />
                        Crear Nueva Fábrica
                    </button>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center p-10"><Loader /></div>
                ) : (
                    <div className="bg-dark-secondary rounded-lg border border-white/10 p-4">
                       <ToolsTable 
                         tools={tools}
                         onEdit={handleOpenModal}
                         onDelete={handleDeleteTool}
                       />
                    </div>
                )}
            </div>

            <AnimatePresence>
            {isModalOpen && (
                <ToolFormModal 
                    key={editingTool ? editingTool._id : 'new'} 
                    factory={editingTool}
                    onSave={handleSaveTool}
                    onClose={handleCloseModal}
                />
            )}
            </AnimatePresence>
        </>
    );
};

export default AdminToolsPage;