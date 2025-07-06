import React from 'react';
import { HiCog6Tooth } from 'react-icons/hi2';
import '../../styles/UserStatsHeader.css';

const UserStatsHeader = ({ user }) => {
    // Si el usuario aún no ha cargado, no renderizar nada o un esqueleto.
    if (!user) {
        return <div className="stats-header-skeleton"></div>;
    }

    return (
        <div className="stats-header">
            <div className="user-info">
                <div className="avatar-placeholder">
                    {/* Puedes poner la inicial del usuario aquí */}
                    <span>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                </div>
                <div className="name-id">
                    <span className="username">{user.username}</span>
                    <span className="userid">ID: {user.telegramId}</span>
                </div>
                <HiCog6Tooth className="settings-icon" />
            </div>
            <div className="stats-cards">
                <div className="stat-card">
                    <span className="stat-label">Horas de trabajo</span>
                    <span className="stat-value">24H</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Velocidad de minería</span>
                    <span className="stat-value">{user.miningRate.toFixed(2)} NTX/H</span>
                </div>
            </div>
        </div>
    );
};

export default UserStatsHeader;