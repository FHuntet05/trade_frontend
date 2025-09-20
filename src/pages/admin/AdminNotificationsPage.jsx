// RUTA: frontend/src/pages/admin/AdminNotificationsPage.jsx (VERSIÓN "NEXUS - REFINED & SIMPLIFIED")

import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import adminApi from '@/pages/admin/api/adminApi';
import { HiOutlineMegaphone, HiOutlineBellAlert } from 'react-icons/hi2';

// --- SUB-COMPONENTES DE UI PARA CONSISTENCIA VISUAL ---
const FormCard = ({ title, description, children }) => (
    <div className="bg-dark-secondary rounded-lg border border-white/10">
        <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const FormInput = ({ name, label, type, register, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input 
            type={type} 
            id={name}
            {...register(name)} 
            className="w-full bg-dark-primary p-2 rounded-md border border-white/20"
            {...props}
        />
    </div>
);


// --- COMPONENTE PRINCIPAL DE LA PÁGINA (Refactorizado) ---
const AdminNotificationsPage = () => {
    const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm({
        defaultValues: { message: '', imageUrl: '', buttonUrl: '', buttonText: '' }
    });

    const onSendNotification = async (data) => {
        if (!data.message || !data.message.trim()) {
            return toast.error("El campo de mensaje no puede estar vacío.");
        }
        
        // Validación: si se proporciona uno de los campos del botón, el otro también es obligatorio.
        if ((data.buttonText && !data.buttonUrl) || (!data.buttonText && data.buttonUrl)) {
            toast.error('Para enviar un botón, tanto el Texto como la URL son requeridos.');
            return;
        }

        const promise = adminApi.post('/admin/notifications/broadcast', data);
        toast.promise(promise, {
            loading: 'Enviando notificación a todos los usuarios...',
            success: (res) => {
                reset(); // Limpia los campos del formulario tras el envío exitoso.
                return res.data.message;
            },
            error: (err) => err.response?.data?.message || 'Error al enviar la notificación.'
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3">
                    <HiOutlineMegaphone /> Enviar Notificación Global
                </h1>
                <p className="text-text-secondary">
                    Envía un mensaje a todos los usuarios activos. Soporta imágenes y botones.
                </p>
            </div>

            <FormCard>
                <form onSubmit={handleSubmit(onSendNotification)} className="space-y-4">
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">Mensaje (Soporta HTML)</label>
                        <textarea 
                            id="message"
                            rows={6}
                            {...register('message', { required: true })}
                            className="w-full bg-dark-primary p-2 rounded-md border border-white/20"
                            placeholder="Escribe tu mensaje aquí..."
                        />
                    </div>
                    <FormInput name="imageUrl" label="URL de la Imagen (Opcional)" type="text" register={register} placeholder="https://ejemplo.com/imagen.jpg" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <FormInput name="buttonText" label="Texto del Botón (Opcional)" type="text" register={register} placeholder="Abrir App" />
                        <FormInput name="buttonUrl" label="URL del Botón (Opcional)" type="text" register={register} placeholder="https://tu-app.com" />
                    </div>
                    
                    <div className="pt-4 text-right">
                         <button 
                            type="submit" 
                            disabled={isSubmitting || !isDirty}
                            className="px-6 py-3 flex items-center justify-center gap-2 font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                        >
                            <HiOutlineBellAlert className="w-5 h-5" />
                            {isSubmitting ? 'Enviando...' : 'Enviar Notificación'}
                        </button>
                    </div>
                </form>
            </FormCard>
        </div>
    );
};

export default AdminNotificationsPage;