// RUTA: frontend/src/components/common/Pagination.jsx (COMPONENTE NUEVO)

import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <span className="text-sm text-text-secondary">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className="px-4 py-2 text-sm font-medium bg-dark-tertiary rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 text-sm font-medium bg-dark-tertiary rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Pagination;