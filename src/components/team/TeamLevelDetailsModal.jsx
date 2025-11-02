// frontend/src/components/team/TeamLevelDetailsModal.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiUserCircle } from 'react-icons/hi2';
import Loader from '../common/Loader';
import TelegramAvatar from '../common/TelegramAvatar';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 25 } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
};

// <<< INICIO DE CORRECCIÓN EN UserRow >>>
const UserRow = ({ user }) => (
  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
    <div className="flex items-center gap-3">
      {user.photoUrl || user.telegramId ? (
        <TelegramAvatar
          telegramId={user.telegramId}
          photoUrl={user.photoUrl}
          alt={user.username}
          className="w-8 h-8 rounded-full object-cover"
          renderFallback={({ className }) => (
            <HiUserCircle className={`w-8 h-8 text-text-secondary ${className}`} />
          )}
        />
      ) : (
        <HiUserCircle className="w-8 h-8 text-text-secondary" />
      )}
      <span className="font-semibold text-white">{user.username}</span>
    </div>
    <div className="text-right">
      {/* 
        1. Se usa 'user.miningRate' para coincidir con la respuesta de la API.
        2. Se añade la guardia '( ... || 0)' para asegurar que .toFixed() siempre reciba un número.
      */}
      <span className="font-mono text-accent-start">
        +{(user.miningRate || 0).toFixed(2)} NTX/H
      </span>
      <p className="text-xs text-text-secondary">Aporte</p>
    </div>
  </div>
);
// <<< FIN DE CORRECCIÓN EN UserRow >>>

// El componente principal TeamLevelDetailsModal necesita un pequeño ajuste en el 'key' del mapeo
// para garantizar que sea único y estable, usando user.username ya que no recibimos _id.

const TeamLevelDetailsModal = ({ level, users, isLoading, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end items-end z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-dark-primary w-full h-[75vh] max-w-lg rounded-t-2xl border-t border-white/10 flex flex-col"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Detalles del Nivel {level}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <HiXMark className="w-6 h-6 text-white" />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader text="Cargando miembros..." />
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-2">
              {/* <<< CAMBIO MENOR: Se usa 'user.username' como clave. Es suficientemente único en este contexto. */}
              {users.map((user, index) => (
                <UserRow key={user.username || index} user={user} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-text-secondary">
              <p>No hay miembros en este nivel todavía.</p>
            </div>
          )}
        </main>
      </motion.div>
    </motion.div>
  );
};

export default TeamLevelDetailsModal;