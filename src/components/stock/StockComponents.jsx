import React from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IOSCard, IOSButton, IOSBadge } from '../ui/IOSComponents';

export const StockPackage = ({ pkg, onSubscribe }) => {
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
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-ios-display font-semibold text-lg">
              {pkg.name}
            </h3>
            <p className="text-text-secondary text-sm">
              {format(pkg.duration * 86400000, "'Plan de' d 'días'", { locale: es })}
            </p>
          </div>
          
          <IOSBadge variant="success">
            +{pkg.dailyReturn}% diario
          </IOSBadge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              Inversión mínima
            </span>
            <span className="font-medium">
              ${pkg.minAmount} USDT
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              Inversión máxima
            </span>
            <span className="font-medium">
              ${pkg.maxAmount} USDT
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              Retorno total
            </span>
            <span className="text-ios-green font-medium">
              {pkg.totalReturn}%
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              Período de bloqueo
            </span>
            <span className="font-medium">
              {format(pkg.lockPeriod * 86400000, "d 'días'", { locale: es })}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              Retorno diario estimado
            </span>
            <span className="text-ios-green font-medium">
              ${((pkg.minAmount * pkg.dailyReturn) / 100).toFixed(2)} - ${((pkg.maxAmount * pkg.dailyReturn) / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <IOSButton
          variant="primary"
          className="w-full mt-6"
          onClick={() => {
            handlePress();
            onSubscribe(pkg);
          }}
        >
          Suscribir Plan
        </IOSButton>
      </IOSCard>
    </animated.div>
  );
};

export const StockPackageList = ({ packages, onSubscribe }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {packages.map((pkg, index) => (
        <motion.div
          key={pkg.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StockPackage 
            pkg={pkg}
            onSubscribe={onSubscribe}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export const InvestmentCalculator = ({ selectedPackage }) => {
  const [amount, setAmount] = React.useState(selectedPackage?.minAmount || 0);
  const dailyReturn = (amount * (selectedPackage?.dailyReturn || 0)) / 100;
  const totalReturn = (amount * (selectedPackage?.totalReturn || 0)) / 100;

  return (
    <IOSCard className="mb-6">
      <h4 className="font-ios-display font-semibold mb-4">
        Calculadora de Inversión
      </h4>

      <input
        type="range"
        min={selectedPackage?.minAmount}
        max={selectedPackage?.maxAmount}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full h-2 bg-system-secondary rounded-full appearance-none"
        style={{
          background: `linear-gradient(to right, var(--ios-green) ${(amount - selectedPackage?.minAmount) / (selectedPackage?.maxAmount - selectedPackage?.minAmount) * 100}%, var(--system-secondary) ${(amount - selectedPackage?.minAmount) / (selectedPackage?.maxAmount - selectedPackage?.minAmount) * 100}%)`
        }}
      />

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">
            Cantidad a invertir
          </span>
          <span className="font-medium">
            ${amount} USDT
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">
            Retorno diario
          </span>
          <span className="text-ios-green font-medium">
            ${dailyReturn.toFixed(2)} USDT
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">
            Retorno total estimado
          </span>
          <span className="text-ios-green font-medium">
            ${totalReturn.toFixed(2)} USDT
          </span>
        </div>
      </div>
    </IOSCard>
  );
};