// frontend/src/components/AuthGuard.jsx (VERSIÓN SIMPLIFICADA Y FINAL)
import React from 'react';
import useUserStore from '../store/userStore';

const AuthGuard = ({ children }) => {
  // Simplemente nos suscribimos al estado del usuario.
  const user = useUserStore((state) => state.user);
  
  // La lógica de inicialización (checkAuthStatus) ya se ejecuta en App.jsx.
  // El loader global también se muestra en App.jsx mientras user es 'undefined'.
  
  // Cuando la inicialización termina, user será un objeto o null.
  // Si es un objeto (usuario logueado), mostramos el contenido protegido.
  if (user) {
    return <>{children}</>;
  }
  
  // Si es null (no logueado), no renderizamos nada.
  // La redirección a una página de login/error se manejaría aquí si tuviéramos una.
  // Por ahora, como la app está dentro de Telegram, no tener usuario es un estado de error.
  // El loader global de App.jsx ya se habrá ocultado.
  // Podríamos mostrar un mensaje de error aquí.
  if (user === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0D1117', color: 'white' }}>
        <p>Autenticación fallida. Por favor, reinicia la Mini App dentro de Telegram.</p>
      </div>
    );
  }
  
  // Este caso (user === undefined) no debería ocurrir porque App.jsx muestra el loader,
  // pero lo dejamos como una salvaguarda.
  return null;
};

export default AuthGuard;