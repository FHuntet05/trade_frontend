// --- START OF FILE src/components/common/GeneratedAvatar.jsx ---

import React from 'react';

// Función para convertir una cadena en un color hexadecimal consistente
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const GeneratedAvatar = ({ name, size = 'w-12 h-12' }) => {
  // Asegurarnos de que el nombre sea una cadena para evitar errores
  const safeName = String(name || 'U');
  const initial = safeName.charAt(0).toUpperCase();
  const backgroundColor = stringToColor(safeName);

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white ${size}`}
      style={{ backgroundColor }}
    >
      <span className="text-xl">{initial}</span>
    </div>
  );
};

export default GeneratedAvatar;

// --- END OF FILE src/components/common/GeneratedAvatar.jsx ---