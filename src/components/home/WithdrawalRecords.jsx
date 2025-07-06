// frontend/src/components/home/WithdrawalRecords.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Datos falsos para simular actividad
const fakeWithdrawals = [
  { email: 'q***mrzt@gmx.com', amount: '160,300.60', currency: 'CLO' },
  { email: 'p***kehdq@gmail.com', amount: '465,201.69', currency: 'CLO' },
  { email: 'x***nab7a@outlook.com', amount: '424,302.10', currency: 'CLO' },
  { email: 'a***user@proton.me', amount: '210,000.00', currency: 'CLO' },
];

const WithdrawalRecords = () => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-white mb-4">Registros de retiro</h2>
      <div className="space-y-2">
        {fakeWithdrawals.map((record, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-sm text-gray-300"
          >
            <span>¡Felicitaciones a </span>
            <span className="font-semibold text-white">{record.email}</span>
            <span> por retirar exitosamente </span>
            <span className="font-bold text-yellow-400">{record.amount} {record.currency}</span>
            <span>!</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WithdrawalRecords;