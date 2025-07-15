// frontend/src/pages/admin/AdminToolsPage.jsx (COMPLETO)
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import ToolFormModal from './components/ToolFormModal';
import { HiPencil, HiTrash } from 'react-icons/hi2';

const AdminToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);

  const fetchTools = useCallback(async () => { setIsLoading(true); try { const { data } = await api.get('/admin/tools'); setTools(data); } catch (e) { toast.error('No se pudieron cargar las herramientas.'); } finally { setIsLoading(false); } }, []);
  useEffect(() => { fetchTools(); }, [fetchTools]);

  const handleOpenModal = (tool = null) => { setEditingTool(tool); setIsModalOpen(true); };
  const handleCloseModal = () => { setEditingTool(null); setIsModalOpen(false); };

  const handleSaveTool = async (formData, toolId) => {
    const isEditing = !!toolId;
    const request = isEditing ? api.put(`/admin/tools/${toolId}`, formData) : api.post('/admin/tools', formData);
    try {
      await toast.promise(request, { loading: 'Guardando...', success: `Herramienta ${isEditing ? 'actualizada' : 'creada'}.`, error: 'Ocurrió un error.' });
      fetchTools(); handleCloseModal();
    } catch (error) { toast.error(error.response?.data?.message || 'Error al guardar.'); }
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta herramienta? Esta acción es irreversible.")) return;
    try {
      await toast.promise(api.delete(`/admin/tools/${toolId}`), { loading: 'Eliminando...', success: 'Herramienta eliminada.', error: 'Ocurrió un error.' });
      fetchTools();
    } catch (error) { toast.error(error.response?.data?.message || 'Error al eliminar.'); }
  };

  return (
    <>
      <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <div className="flex justify-between items-center mb-4"><h1 className="text-2xl font-semibold">Gestión de Herramientas</h1><button onClick={() => handleOpenModal()} className="px-4 py-2 font-bold text-white bg-accent-start rounded-lg">Crear Herramienta</button></div>
        {isLoading ? <Loader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => (
              <div key={tool._id} className="bg-dark-primary p-4 rounded-lg border border-white/10 flex flex-col justify-between">
                <img src={tool.imageUrl} alt={tool.name} className="w-full h-32 object-contain rounded-t-lg mb-4" />
                <h3 className="font-bold text-lg">{tool.name} <span className="text-xs text-text-secondary">(V{tool.vipLevel})</span></h3>
                <div className="text-sm text-text-secondary space-y-1 mt-2">
                  <p>Precio: <span className="font-mono text-white">{tool.price} USDT</span></p>
                  <p>Ganancia: <span className="font-mono text-white">{tool.miningBoost} NTX/Día</span></p>
                  <p>Duración: <span className="font-mono text-white">{tool.durationDays} días</span></p>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/10"><button onClick={() => handleOpenModal(tool)} className="flex-1 px-3 py-1.5 text-xs flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 rounded-md"><HiPencil /> Editar</button><button onClick={() => handleDeleteTool(tool._id)} className="flex-1 px-3 py-1.5 text-xs flex items-center justify-center gap-2 bg-red-500/20 text-red-400 rounded-md"><HiTrash /> Eliminar</button></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>{isModalOpen && <ToolFormModal tool={editingTool} onClose={handleCloseModal} onSave={handleSaveTool} />}</AnimatePresence>
    </>
  );
};
export default AdminToolsPage;