import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const UserGrowthChart = ({ data }) => {
  return (
    <div className="w-full h-72"> {/* Altura fija para consistencia */}
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
          <YAxis allowDecimals={false} stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(20, 20, 20, 0.9)', 
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: '#FFFFFF' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line type="monotone" dataKey="NuevosUsuarios" name="Nuevos Usuarios" stroke="#EC4899" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthChart;