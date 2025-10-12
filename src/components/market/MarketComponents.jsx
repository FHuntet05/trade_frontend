import React from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IOSCard, IOSButton, IOSBadge } from '../ui/IOSComponents';

export const MarketItem = ({ item, onInvest }) => {
  const [springProps, api] = useSpring(() => ({
    scale: 1,
  }));

  const handlePress = () => {
    api.start({
      from: { scale: 1 },
      to: [
        { scale: 0.95 },
        { scale: 1 }
      ],
    });
  };

  return (
    <animated.div style={springProps}>
      <IOSCard className="mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-ios-green/10 flex items-center justify-center">
            <img 
              src={item.image} 
              alt={item.symbol}
              className="w-8 h-8"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-ios-display font-semibold text-lg">
                  {item.name}
                </h3>
                <p className="text-text-secondary text-sm">
                  {item.symbol}
                </p>
              </div>
              
              <IOSBadge variant="success">
                +{item.dailyReturn}% diario
              </IOSBadge>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  Inversión mínima
                </span>
                <span className="font-medium">
                  ${item.minInvestment} USDT
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  Duración
                </span>
                <span className="font-medium">
                  {format(item.duration * 3600000, "'Cada' H 'horas'", { locale: es })}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  Retorno total
                </span>
                <span className="text-ios-green font-medium">
                  {(item.dailyReturn * (item.duration / 24)).toFixed(2)}%
                </span>
              </div>
            </div>

            <IOSButton
              variant="primary"
              className="w-full mt-4"
              onClick={() => {
                handlePress();
                onInvest(item);
              }}
            >
              Invertir Ahora
            </IOSButton>
          </div>
        </div>
      </IOSCard>
    </animated.div>
  );
};

export const MarketList = ({ items, onInvest }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <MarketItem 
            item={item}
            onInvest={onInvest}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export const MarketFilters = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'popular', label: 'Populares' },
    { id: 'new', label: 'Nuevos' },
    { id: 'ending', label: 'Finalizando' }
  ];

  return (
    <div className="flex p-1 bg-system-secondary rounded-ios mb-6">
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`
            flex-1 py-2 px-4 rounded-ios text-sm font-ios
            transition-all
            ${activeFilter === filter.id
              ? 'bg-white text-text-primary shadow-ios-button'
              : 'text-text-secondary'
            }
          `}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};