// frontend/src/components/home/TaskCenter.jsx (VERSIÓN FINAL DINÁMICA)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axiosConfig';
import useUserStore from '../../store/userStore';
// 1. Importamos el componente de item de tarea que creamos previamente
import TaskItem from '../tasks/TaskItem'; 
// Asegúrate de que la ruta de importación sea correcta.
// Si no lo creaste, dime y te lo proporciono de nuevo.

const TaskCenter = () => {
  const { user, updateUser } = useUserStore();
  const [taskStatus, setTaskStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Definimos nuestras tareas, ordenadas por recompensa (mayor a menor)
  const allTasks = [
    { id: 'boughtUpgrade', title: 'Primera Mejora', description: 'Compra cualquier herramienta VIP.', reward: 1500 },
    { id: 'invitedTenFriends', title: 'Invitar 10 Amigos', description: 'Tu equipo debe tener 10 miembros.', reward: 1000 },
    { id: 'joinedTelegram', title: 'Unirse al Canal', description: 'Únete a nuestra comunidad oficial.', reward: 500, link: 'https://t.me/TuCanalDeTelegram' }, // Reemplaza con tu link real
  ];

  // 3. useEffect para cargar el estado de las tareas al montar el componente
  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        const response = await api.get('/tasks/status');
        setTaskStatus(response.data);
      } catch (err) {
        console.error("Error al cargar el estado de las tareas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskStatus();
  }, []);

  // 4. Función para actualizar el estado global y local después de un reclamo exitoso
  const handleClaimSuccess = (updatedUser) => {
    updateUser(updatedUser);
    // Volvemos a pedir el estado para actualizar la UI sin recargar la página
    api.get('/tasks/status').then(res => setTaskStatus(res.data));
  };
  
  // Renderizamos un esqueleto o nada mientras carga
  if (loading) {
    return (
        <div className="w-full space-y-4 bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white text-left mb-2">Centro de Tareas</h2>
            <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
            <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
        </div>
    );
  }

  return (
    <div className="w-full space-y-4 bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/10">
      <h2 className="text-xl font-bold text-white text-left mb-2">Centro de Tareas</h2>
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {allTasks.map(task => {
          if (!taskStatus) return null; // No renderizar nada si el estado no ha cargado

          const isClaimed = taskStatus.claimedTasks?.[task.id] || false;
          let isCompleted = isClaimed;

          // Lógica para determinar si una tarea está completada pero no reclamada
          if (!isClaimed) {
            if (task.id === 'boughtUpgrade') {
              isCompleted = user?.activeTools?.length > 0;
            } else if (task.id === 'invitedTenFriends') {
              isCompleted = taskStatus.referralCount >= 10;
            } else if (task.id === 'joinedTelegram') {
              isCompleted = true; // El botón "Ir" se encarga de la acción. Es reclamable por defecto.
            }
          }

          return (
            <TaskItem
              key={task.id}
              task={task}
              isClaimed={isClaimed}
              isCompleted={isCompleted}
              referralCount={taskStatus.referralCount || 0}
              onClaimSuccess={handleClaimSuccess}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default TaskCenter;