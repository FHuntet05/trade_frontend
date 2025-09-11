// RUTA: admin-frontend/src/pages/admin/components/ToolsTable.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Componente de UI pura para mostrar la lista de Fábricas/VIPs.

import React from 'react';
import { HiPencil, HiTrash } from 'react-icons/hi2';

const ToolsTable = ({ tools, onEdit, onDelete }) => {
    
    // Función de ayuda para formatear números como moneda
    const formatCurrency = (amount) => {
        return `$${(amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
                
                {/* --- Encabezado --- */}
                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                    <tr>
                        <th scope="col" className="px-6 py-3">Fábrica</th>
                        <th scope="col" className="px-6 py-3 text-center">Nivel VIP</th>
                        <th scope="col" className="px-6 py-3 text-right">Precio</th>
                        <th scope="col" className="px-6 py-3 text-right">Prod. Diaria</th>
                        <th scope="col" className="px-6 py-3 text-center">Duración</th>
                        <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                </thead>

                {/* --- Cuerpo --- */}
                <tbody className="divide-y divide-white/10">
                    {tools.map((tool) => (
                        <tr key={tool._id} className="hover:bg-dark-tertiary/50 transition-colors">
                            
                            {/* Celda: Nombre y Imagen */}
                            <th scope="row" className="px-6 py-4 font-medium text-white">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={tool.imageUrl} 
                                        alt={tool.name}
                                        className="w-12 h-12 object-contain rounded-md bg-dark-primary p-1" 
                                    />
                                    <div>
                                        <span>{tool.name}</span>
                                        {tool.isFree && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-cyan-300 bg-cyan-500/20 rounded-full">
                                                Gratis
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </th>

                            {/* Celda: Nivel VIP */}
                            <td className="px-6 py-4 text-center font-mono text-lg">{tool.vipLevel}</td>
                            
                            {/* Celda: Precio */}
                            <td className="px-6 py-4 text-right font-mono">{formatCurrency(tool.price)}</td>

                            {/* Celda: Producción Diaria */}
                            <td className="px-6 py-4 text-right font-mono text-green-400">{formatCurrency(tool.dailyProduction)}/Día</td>
                            
                            {/* Celda: Duración */}
                            <td className="px-6 py-4 text-center font-mono">{tool.durationDays} Días</td>

                            {/* Celda: Acciones */}
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center items-center gap-2">
                                    <button onClick={() => onEdit(tool)} className="p-2 rounded-md hover:bg-indigo-500/20 text-indigo-400" title="Editar">
                                        <HiPencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onDelete(tool._id)} className="p-2 rounded-md hover:bg-red-500/20 text-red-400" title="Eliminar">
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* --- Mensaje de Estado Vacío --- */}
            {tools.length === 0 && (
                <div className="text-center p-8 text-text-secondary">
                    <h3 className="text-lg font-semibold">No hay fábricas creadas</h3>
                    <p>Haz clic en "Crear Nueva Fábrica" para empezar a añadir niveles de inversión.</p>
                </div>
            )}
        </div>
    );
};

export default ToolsTable;