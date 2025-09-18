// RUTA: frontend/components/tasks/TaskItem.jsx (VERSIÓN NEXUS - LÓGICA CORREGIDA)
import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaGift, FaTelegramPlane, FaUsers, FaHammer } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi2';

const ICONS = {
    joinedTelegram: <FaTelegramPlane className="w-4 h-4" />,
    inviteFriends: <FaUsers className="w-4 h-4" />,
};

const TaskItem = ({ task, onGoToTask, onClaim }) => {
    // ======================= INICIO DE LA CORRECCIÓN CRÍTICA =======================
    // Se desestructuran las propiedades correctas directamente del prop 'task'.
    // La propiedad más importante es 'taskId'.
    const { taskId, title, description, reward, progress, target, status, isClaimed, link } = task;

    const renderButton = () => {
        if (isClaimed) {
            return (
                <button disabled className="bg-green-500/50 text-white text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2 cursor-not-allowed">
                    <FaCheckCircle /> Reclamado
                </button>
            );
        }

        // La lógica ahora se basa en el 'status' que viene de la API para cada tarea.
        switch (status) {
            case 'claimable':
                return (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onClaim(taskId)}
                        className="bg-accent-start text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
                    >
                        Reclamar
                    </motion.button>
                );
            case 'action_required': // Un estado donde el usuario debe hacer algo (ej: visitar un link)
                return (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onGoToTask(task)}
                        className="bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2"
                    >
                        Ir <HiArrowRight />
                    </motion.button>
                );
            case 'in_progress':
            default: // Cualquier otro estado se considera 'en progreso' o 'pendiente'
                const progressText = (progress !== undefined && target) ? `(${progress}/${target})` : '';
                return (
                    <button disabled className="bg-gray-600/50 text-gray-400 text-sm font-semibold px-4 py-1.5 rounded-lg cursor-not-allowed">
                        Pendiente {progressText}
                    </button>
                );
        }
    };
    // ======================== FIN DE LA CORRECCIÓN CRÍTICA =========================

    return (
        <motion.div 
            className="bg-dark-secondary/70 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col space-y-3"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
        >
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-white pr-4">{title}</h3>
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold flex-shrink-0 bg-black/20 px-2 py-1 rounded-full">
                    <FaGift />
                    <span>{reward.toLocaleString()}</span>
                </div>
            </div>
            <div className="flex justify-between items-end">
                <div className="text-sm text-text-secondary flex items-center gap-2">
                    {ICONS[taskId] || ''}
                    <span>{description}</span>
                </div>
                {renderButton()}
            </div>
        </motion.div>
    );
};

export default TaskItem;