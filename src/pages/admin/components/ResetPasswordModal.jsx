// RUTA: frontend/src/pages/admin/components/ResetPasswordModal.jsx (VERSIÓN "NEXUS VALIDATED")
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamationTriangle, HiXMark } from 'react-icons/hi2';

// --- Variantes de Animación (Validadas) ---
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
};


const ResetPasswordModal = ({ user, onClose, onConfirm }) => {
  // [NEXUS VALIDATION] El componente es puramente presentacional y de confirmación.
  // Su lógica de recibir props y llamar a onConfirm(user._id) es correcta.
  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="bg-dark-secondary rounded-lg border border-white/10 shadow-xl w-full max-w-md"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-500/20 sm:mx-0">
                <HiExclamationTriangle className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="mt-0 text-left">
                <h3 className="text-lg leading-6 font-bold text-white" id="modal-title">
                  Resetear Contraseña
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-text-secondary">
                    ¿Estás seguro de que deseas resetear la contraseña para el administrador{' '}
                    <strong className="text-white">{user.username}</strong>?
                  </p>
                  <p className="mt-2 text-xs text-text-secondary/70">
                    Se generará una nueva contraseña temporal y el administrador deberá cambiarla en su próximo inicio de sesión. Esta acción es irreversible.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-dark-tertiary px-6 py-4 flex flex-row-reverse gap-3">
            <button
              type="button"
              onClick={() => onConfirm(user._id)}
              className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-600"
            >
              Confirmar y Resetear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResetPasswordModal;