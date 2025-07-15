// frontend/src/pages/admin/components/UserGrowthChart.jsx (COMPLETO)
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const UserGrowthChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" />
          <YAxis allowDecimals={false} stroke="rgba(255, 255, 255, 0.5)" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 30, 30, 0.8)', 
              borderColor: 'rgba(255, 255, 255, 0.2)' 
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="NuevosUsuarios" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthChart;