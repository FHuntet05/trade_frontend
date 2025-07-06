// frontend/src/components/ui/CustomSelect.jsx (VERSIÓN CORREGIDA)
import React from 'react';
import * as Select from '@radix-ui/react-select';
import { HiChevronDown, HiCheck } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ value, onValueChange, placeholder, options }) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="w-full flex items-center justify-between bg-dark-primary/50 p-3 rounded-lg focus:outline-none border-2 border-transparent data-[state=open]:border-accent-start">
        <Select.Value placeholder={placeholder} />
        {/* CORRECCIÓN: La etiqueta de cierre ahora es </Select.Icon> */}
        <Select.Icon className="text-text-secondary">
          <HiChevronDown />
        </Select.Icon>
      </Select.Trigger>

      {/* Usamos forceMount para asegurar que AnimatePresence funcione correctamente con Radix */}
      <Select.Portal forceMount>
        <AnimatePresence>
          {/* Se renderiza el contenido solo cuando el estado es 'open' */}
          <Select.Content 
            asChild 
            position="popper" 
            className="z-[100] bg-dark-secondary border border-white/10 rounded-lg shadow-lg w-[--radix-select-trigger-width] mt-1"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Select.Viewport className="p-1">
                {options.map(option => (
                  <Select.Item 
                    key={option.value} 
                    value={option.value} 
                    className="relative flex items-center p-2 rounded-md text-sm text-white/80 select-none data-[highlighted]:bg-white/10 data-[highlighted]:text-white focus:outline-none cursor-pointer"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="absolute right-2 flex items-center">
                      <HiCheck />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </motion.div>
          </Select.Content>
        </AnimatePresence>
      </Select.Portal>
    </Select.Root>
  );
};

export default CustomSelect;