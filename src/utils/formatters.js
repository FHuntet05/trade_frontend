export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  
  // Para números pequeños (menores a 0.01)
  if (num < 0.01 && num > 0) {
    return num.toFixed(8);
  }
  
  // Para números normales
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatCurrency = (num) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatCompactNumber = (num) => {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(Math.abs(num)) / 3);
  
  if (magnitude === 0) return formatNumber(num);
  
  const scaled = num / Math.pow(10, magnitude * 3);
  return formatNumber(scaled) + suffixes[magnitude];
};

export const formatPercentage = (num) => {
  return num.toFixed(2) + '%';
};

export const getColorForPercentage = (percentage) => {
  if (percentage > 0) return 'text-ios-green';
  if (percentage < 0) return 'text-[#FF3B30]';
  return 'text-text-secondary';
};

export const getColorForRSI = (rsi) => {
  if (rsi > 70) return 'text-[#FF3B30]';
  if (rsi < 30) return 'text-ios-green';
  return 'text-text-secondary';
};

export const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
    segundo: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return `hace ${interval} ${unit}${interval !== 1 ? 's' : ''}`;
    }
  }
  
  return 'ahora';
};