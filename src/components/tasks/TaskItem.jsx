// frontend/components/tasks/TaskItem.jsx (CÓDIGO COMPLETO Y SIN CAMBIOS)
import React from 'react';
import { motion } from 'framer-motion';
import { FaTelegramPlane, FaCheckCircle, FaGift, FaUsers, FaHammer } from 'react-icons/fa';

const ICONS = {
    joinedTelegram: <FaTelegramPlane />,
    invitedTenFriends: <FaUsers />,
    boughtUpgrade: <FaHammer />,
};

const TaskItem = ({ task, status, onGoToTask, onClaim }) => {
    const { id, title, description, reward, link } = task;
    const isClaimed = status?.claimedTasks?.[id] || false;
    
    const getCompletionStatus = () => {
        if (isClaimed) return 'claimed';
        switch (id) {
            case 'boughtUpgrade':
                return status?.hasBoughtUpgrade ? 'claimable' : 'pending';
            case 'invitedTenFriends':
                return (status?.referralCount || 0) >= 3 ? 'claimable' : 'pending';
            case 'joinedTelegram':
                return status?.telegramVisited ? 'claimable' : 'visitable';
            default:
                return 'pending';
        }
    };

    const completionStatus = getCompletionStatus();

    const renderButton = () => {
        switch (completionStatus) {
            case 'claimed':
                return (
                    <button disabled className="bg-green-500/50 text-white text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2 cursor-not-allowed">
                        <FaCheckCircle /> Reclamado
                    </button>
                );
            case 'claimable':
                return (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onClaim(id)}
                        className="bg-accent-start text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
                    >
                        Reclamar
                    </motion.button>
                );
            case 'visitable':
                return (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onGoToTask(task)}
                        className="bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
                    >
                        Ir
                    </motion.button>
                );
            case 'pending':
            default:
                const progressText = id === 'invitedTenFriends' ? `(${(status?.referralCount || 0)}/3)` : '';
                return (
                    <button disabled className="bg-gray-600/50 text-gray-400 text-sm font-semibold px-4 py-1.5 rounded-lg cursor-not-allowed">
                        {id === 'invitedTenFriends' ? 'Invitar' : 'Pendiente'} {progressText}
                    </button>
                );
        }
    };

    return (
        <div className="bg-dark-primary/70 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-col space-y-2">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white pr-4">{title}</h3>
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold flex-shrink-0">
                    <FaGift />
                    <span>{reward.toLocaleString()}</span>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400 flex items-center gap-2">
                    {ICONS[id] || ''}
                    <span>{description}</span>
                </div>
                {renderButton()}
            </div>
        </div>
    );
};

export default TaskItem;