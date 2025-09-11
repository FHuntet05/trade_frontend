// RUTA: admin-frontend/src/pages/admin/AdminToolsPage.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Página de gestión para las Fábricas (VIPs), adaptada y mejorada.

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

// --- Componentes Reutilizables y de UI ---
import Loader from '../../components/common/Loader';
import ToolFormModal from './components/ToolFormModal'; // Usamos el nombre del modal de su imagen
import ToolsTable from './components/ToolsTable'; // Usaremos una tabla específica
import { HiOutlineWrenchScrewdriver, HiPlus } from 'react-icons/hi2';

const AdminToolsPage = () => {
    // --- Estado de la Página ---
    const [tools, setTools] = useState([]); // Almacenará la lista de Fábricas/Herramientas
    const [isLoading, setIsLoading] = useState(true);
    
    // --- Estado para el Modal de Edición/Creación ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState(null); // Si no es null, estamos editando

    // --- Carga de Datos ---
    const fetchTools = useCallback(async () => {
        setIsLoading(true);
        try {
            // [BLOCKSPHERE] Llamamos al endpoint estandarizado '/admin/factories'.
            const { data } = await api.get('/admin/factories');
            setTools(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al cargar las fábricas.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTools();
    }, [fetchTools]);

    // --- Handlers para el Modal ---
    const handleOpenModal = (tool = null) => {
        setEditingTool(tool); // Si pasamos una 'tool', la estamos editando. Si es null, creamos una nueva.
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTool(null);
        setIsModalOpen(false);
    };

    // --- Lógica de la API para Guardar (Crear o Actualizar) ---
    const handleSaveTool = async (formData, toolId) => {
        const isEditing = !!toolId;
        const request = isEditing 
            ? api.put(`/admin/factories/${toolId}`, formData) // Actualizar
            : api.post('/admin/factories', formData);       // Crear

        toast.promise(request, {
            loading: 'Guardando datos...',
            success: () => {
                handleCloseModal();
                fetchTools(); // Recargar la lista.
                return `Fábrica ${isEditing ? 'actualizada' : 'creada'} correctamente.`;
            },
            error: (err) => err.response?.data?.message || 'Error al guardar los datos.',
        });
    };

    // --- Lógica de la API para Eliminar ---
    const handleDeleteTool = async (toolId) => {
        // Usamos una confirmación nativa del navegador por simplicidad y seguridad.
        if (window.confirm('¿Seguro que quieres eliminar esta fábrica? Esta acción es irreversible.')) {
            const promise = api.delete(`/admin/factories/${toolId}`);
            toast.promise(promise, {
                loading: 'Eliminando fábrica...',
                success: () => {
                    fetchTools(); // Recargar la lista.
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

            {/* --- Modal de Formulario --- */}
            <AnimatePresence>
            {isModalOpen && (
                <ToolFormModal 
                    // El key es importante para que React remonte el componente si cambia el item a editar.
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