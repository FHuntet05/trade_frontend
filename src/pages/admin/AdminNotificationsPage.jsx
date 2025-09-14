// RUTA: frontend/src/pages/admin/AdminNotificationsPage.jsx (FASE "REMEDIATIO" - RUTAS CON ALIAS CORREGIDAS)

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
// [REMEDIATIO - SOLUCIÓN ESTRUCTURAL] Se aplica el alias de ruta.
import adminApi from '@/pages/admin/api/adminApi';
import { HiOutlineMegaphone } from 'react-icons/hi2';

const AdminNotificationsPage = () => {
    const [targetType, setTargetType] = useState('all');
    const [targetValue, setTargetValue] = useState('');
    const [message, setMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [buttons, setButtons] = useState([{ text: '', url: '' }]);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddButton = useCallback(() => {
        setButtons(prevButtons => [...prevButtons, { text: '', url: '' }]);
    }, []);

    const handleRemoveButton = useCallback((indexToRemove) => {
        setButtons(prevButtons => prevButtons.filter((_, index) => index !== indexToRemove));
    }, []);
    
    const handleButtonChange = useCallback((indexToChange, field, value) => {
        setButtons(prevButtons => 
            prevButtons.map((button, index) => {
                if (index === indexToChange) {
                    return { ...button, [field]: value };
                }
                return button;
            })
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!message.trim()) {
            return toast.error("El campo de mensaje no puede estar vacío.");
        }
        if (targetType === 'id' && !targetValue.trim()) {
            return toast.error("Debe proporcionar un ID de Telegram específico.");
        }
        
        setIsLoading(true);
        try {
            const finalButtons = buttons.filter(b => b.text.trim() && b.url.trim());
            
            const payload = {
                message,
                target: { type: targetType, value: targetValue },
                imageUrl: imageUrl.trim() || null,
                buttons: finalButtons.length > 0 ? finalButtons : null
            };
            
            const { data } = await adminApi.post('/admin/notifications/broadcast', payload); // Corregido endpoint
            toast.success(data.message);
            
            setMessage(''); 
            setImageUrl(''); 
            setButtons([{ text: '', url: '' }]);
            setTargetValue('');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al enviar la notificación.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3">
                    <HiOutlineMegaphone /> Notificaciones a Usuarios
                </h1>
                <p className="text-text-secondary">
                    Envía mensajes masivos o individuales a los usuarios del bot de Telegram.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-dark-secondary p-6 rounded-lg border border-white/10 space-y-6">
                <div>
                    <label htmlFor="targetType" className="block mb-2 text-sm font-medium">Público Objetivo</label>
                    <div className="flex gap-4">
                        <select
                            id="targetType"
                            value={targetType}
                            onChange={(e) => setTargetType(e.target.value)}
                            className="bg-dark-tertiary border border-white/10 rounded-lg p-2.5"
                        >
                            <option value="all">Todos los Usuarios</option>
                            <option value="id">ID de Telegram Específico</option>
                        </select>
                        {targetType === 'id' && (
                            <input
                                id="targetValue"
                                type="text"
                                value={targetValue}
                                onChange={(e) => setTargetValue(e.target.value)}
                                placeholder="Introduce el ID de Telegram"
                                className="flex-grow bg-dark-tertiary border border-white/10 rounded-lg p-2.5"
                            />
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="message" className="block mb-2 text-sm font-medium">
                        Mensaje (soporta HTML básico como &lt;b&gt; y &lt;i&gt;)
                    </label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="8"
                        className="w-full bg-dark-tertiary border border-white/10 rounded-lg p-2.5"
                        required
                    ></textarea>
                </div>
                
                <div>
                    <label htmlFor="imageUrl" className="block mb-2 text-sm font-medium">URL de Imagen (Opcional)</label>
                    <input
                        id="imageUrl"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full bg-dark-tertiary border border-white/10 rounded-lg p-2.5"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium">Botones (Opcional)</label>
                    {buttons.map((btn, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <input
                                type="text"
                                value={btn.text}
                                onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                                placeholder={`Texto del Botón ${index + 1}`}
                                className="w-1/3 bg-dark-tertiary border border-white/10 rounded-lg p-2"
                            />
                            <input
                                type="url"
                                value={btn.url}
                                onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
                                placeholder={`URL del Enlace ${index + 1}`}
                                className="w-2/3 bg-dark-tertiary border border-white/10 rounded-lg p-2"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveButton(index)}
                                className="text-red-400 p-2 rounded-full hover:bg-red-500/20"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddButton}
                        className="text-sm text-accent-start hover:underline"
                    >
                        + Añadir Botón
                    </button>
                </div>

                <div className="text-right border-t border-white/10 pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Enviando...' : 'Enviar Notificación'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminNotificationsPage;