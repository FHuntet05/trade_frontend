import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const IOSModal = ({ isOpen, onClose, children, type = 'modal' }) => {
  const modalVariants = {
    modal: {
      hidden: {
        opacity: 0,
        scale: 1.1
      },
      visible: {
        opacity: 1,
        scale: 1
      },
      exit: {
        opacity: 0,
        scale: 0.95
      }
    },
    sheet: {
      hidden: {
        opacity: 0,
        y: '100%'
      },
      visible: {
        opacity: 1,
        y: 0
      },
      exit: {
        opacity: 0,
        y: '100%'
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal/Sheet */}
          <motion.div
            className={`fixed z-50 ${
              type === 'modal'
                ? 'left-4 right-4 top-1/2 -translate-y-1/2'
                : 'left-0 right-0 bottom-0'
            }`}
            variants={modalVariants[type]}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
          >
            <div
              className={`bg-system-background ${
                type === 'modal'
                  ? 'rounded-ios-xl'
                  : 'rounded-t-ios-xl'
              } overflow-hidden shadow-ios-card`}
            >
              {type === 'sheet' && (
                <div className="w-12 h-1 bg-system-secondary rounded-full mx-auto my-2" />
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const IOSActionSheet = ({
  isOpen,
  onClose,
  title,
  actions,
  destructiveAction
}) => {
  return (
    <IOSModal isOpen={isOpen} onClose={onClose} type="sheet">
      <div className="p-4">
        {title && (
          <h3 className="text-center font-ios-display font-semibold mb-4">
            {title}
          </h3>
        )}
        
        <div className="space-y-2">
          {actions.map((action, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 bg-system-secondary rounded-ios text-center font-ios text-ios-green"
              onClick={() => {
                action.onPress();
                onClose();
              }}
            >
              {action.title}
            </motion.button>
          ))}
          
          {destructiveAction && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 bg-system-secondary rounded-ios text-center font-ios text-red-500 mt-2"
              onClick={() => {
                destructiveAction.onPress();
                onClose();
              }}
            >
              {destructiveAction.title}
            </motion.button>
          )}
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 bg-system-secondary rounded-ios text-center font-ios"
            onClick={onClose}
          >
            Cancelar
          </motion.button>
        </div>
      </div>
    </IOSModal>
  );
};

export const IOSAlert = ({ isOpen, onClose, title, message, actions }) => {
  return (
    <IOSModal isOpen={isOpen} onClose={onClose} type="modal">
      <div className="p-6">
        <h3 className="text-lg font-ios-display font-semibold text-center mb-2">
          {title}
        </h3>
        <p className="text-text-secondary text-center mb-6">
          {message}
        </p>
        <div className="flex space-x-3">
          {actions.map((action, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 p-3 rounded-ios font-ios ${
                action.style === 'destructive'
                  ? 'bg-red-500 text-white'
                  : action.style === 'cancel'
                  ? 'bg-system-secondary text-text-primary'
                  : 'bg-ios-green text-white'
              }`}
              onClick={() => {
                action.onPress();
                onClose();
              }}
            >
              {action.title}
            </motion.button>
          ))}
        </div>
      </div>
    </IOSModal>
  );
};