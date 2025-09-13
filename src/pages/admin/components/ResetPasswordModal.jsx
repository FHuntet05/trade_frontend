// frontend/src/pages/admin/components/ResetPasswordModal.jsx
import React from 'react';
import Modal from '../../../components/common/Modal';

const ResetPasswordModal = ({ user, onClose, onConfirm }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Resetear Contraseña">
      <div className="p-4 text-text-secondary">
        <p>
          ¿Estás seguro de que deseas resetear la contraseña para el administrador{' '}
          <strong className="text-white">{user.username}</strong>?
        </p>
        <p className="mt-2 text-sm">
          Se generará una nueva contraseña temporal y el administrador deberá cambiarla en su próximo inicio de sesión.
        </p>
      </div>
      <div className="bg-dark-tertiary p-4 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700">
          Cancelar
        </button>
        <button onClick={() => onConfirm(user._id)} className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-600">
          Confirmar y Resetear
        </button>
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;