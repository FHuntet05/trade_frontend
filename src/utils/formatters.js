// RUTA: src/utils/formatters.js

const formatCurrency = (value, maximumFractionDigits = 2) => {
  const number = Number(value);
  if (isNaN(number)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(number);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const formatters = {
  formatCurrency,
  formatDate,
};