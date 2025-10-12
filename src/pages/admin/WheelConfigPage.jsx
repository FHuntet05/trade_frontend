import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IOSLayout, IOSCard, IOSButton, IOSInput } from '../ui/IOSComponents';
import { SpinningWheel } from '../wheel/SpinningWheel';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const WheelSegmentConfig = ({ segment, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState(segment);

  const handleSave = () => {
    onUpdate(config);
    setIsEditing(false);
  };

  return (
    <IOSCard className="p-4 mb-4">
      {isEditing ? (
        <div className="space-y-4">
          <IOSInput
            label="Icono"
            value={config.icon}
            onChange={(e) => setConfig({ ...config, icon: e.target.value })}
          />
          <IOSInput
            label="Texto"
            value={config.text}
            onChange={(e) => setConfig({ ...config, text: e.target.value })}
          />
          <IOSInput
            type="number"
            label="Porcentaje"
            value={config.percentage}
            onChange={(e) => setConfig({ ...config, percentage: parseFloat(e.target.value) })}
          />
          <IOSInput
            label="Color"
            value={config.color}
            onChange={(e) => setConfig({ ...config, color: e.target.value })}
          />
          <div className="flex space-x-2">
            <IOSButton variant="primary" onClick={handleSave}>
              Guardar
            </IOSButton>
            <IOSButton variant="secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </IOSButton>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-2xl">{segment.icon}</span>
            <div>
              <p className="font-semibold">{segment.text}</p>
              <p className="text-sm text-text-secondary">{segment.percentage}%</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <IOSButton variant="secondary" onClick={() => setIsEditing(true)}>
              Editar
            </IOSButton>
            <IOSButton variant="danger" onClick={() => onDelete(segment.id)}>
              Eliminar
            </IOSButton>
          </div>
        </div>
      )}
    </IOSCard>
  );
};

const WheelConfigPage = () => {
  const [segments, setSegments] = useState([]);
  const [isPreviewSpinning, setIsPreviewSpinning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSegment, setNewSegment] = useState({
    icon: '🎁',
    text: 'Premio',
    percentage: 10,
    color: 'bg-ios-green'
  });

  useEffect(() => {
    loadWheelConfig();
  }, []);

  const loadWheelConfig = async () => {
    try {
      const response = await api.get('/admin/wheel-config');
      setSegments(response.data.segments);
    } catch (error) {
      toast.error('Error al cargar la configuración');
    }
  };

  const handleAddSegment = async () => {
    try {
      await api.post('/admin/wheel-config/segments', newSegment);
      toast.success('Segmento añadido');
      loadWheelConfig();
      setShowAddForm(false);
      setNewSegment({
        icon: '🎁',
        text: 'Premio',
        percentage: 10,
        color: 'bg-ios-green'
      });
    } catch (error) {
      toast.error('Error al añadir segmento');
    }
  };

  const handleUpdateSegment = async (updatedSegment) => {
    try {
      await api.put(`/admin/wheel-config/segments/${updatedSegment.id}`, updatedSegment);
      toast.success('Segmento actualizado');
      loadWheelConfig();
    } catch (error) {
      toast.error('Error al actualizar segmento');
    }
  };

  const handleDeleteSegment = async (segmentId) => {
    try {
      await api.delete(`/admin/wheel-config/segments/${segmentId}`);
      toast.success('Segmento eliminado');
      loadWheelConfig();
    } catch (error) {
      toast.error('Error al eliminar segmento');
    }
  };

  const handleSpinComplete = (prize) => {
    toast.success(`Premio seleccionado: ${prize.text}`);
  };

  return (
    <IOSLayout>
      <div className="min-h-screen bg-system-background p-4">
        <h1 className="text-2xl font-ios-display font-bold mb-6">
          Configuración de Ruleta
        </h1>

        <div className="mb-8">
          <h2 className="text-lg font-ios-display mb-4">Vista Previa</h2>
          <SpinningWheel
            segments={segments}
            onSpinComplete={handleSpinComplete}
            isSpinning={isPreviewSpinning}
            setIsSpinning={setIsPreviewSpinning}
          />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-ios-display">Segmentos</h2>
            <IOSButton
              variant="primary"
              onClick={() => setShowAddForm(true)}
            >
              Añadir Segmento
            </IOSButton>
          </div>

          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <IOSCard className="p-4 space-y-4">
                <IOSInput
                  label="Icono"
                  value={newSegment.icon}
                  onChange={(e) => setNewSegment({ ...newSegment, icon: e.target.value })}
                />
                <IOSInput
                  label="Texto"
                  value={newSegment.text}
                  onChange={(e) => setNewSegment({ ...newSegment, text: e.target.value })}
                />
                <IOSInput
                  type="number"
                  label="Porcentaje"
                  value={newSegment.percentage}
                  onChange={(e) => setNewSegment({ ...newSegment, percentage: parseFloat(e.target.value) })}
                />
                <IOSInput
                  label="Color"
                  value={newSegment.color}
                  onChange={(e) => setNewSegment({ ...newSegment, color: e.target.value })}
                />
                <div className="flex space-x-2">
                  <IOSButton variant="primary" onClick={handleAddSegment}>
                    Guardar
                  </IOSButton>
                  <IOSButton variant="secondary" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </IOSButton>
                </div>
              </IOSCard>
            </motion.div>
          )}

          {segments.map((segment) => (
            <WheelSegmentConfig
              key={segment.id}
              segment={segment}
              onUpdate={handleUpdateSegment}
              onDelete={handleDeleteSegment}
            />
          ))}
        </div>
      </div>
    </IOSLayout>
  );
};

export default WheelConfigPage;