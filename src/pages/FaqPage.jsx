// src/pages/FaqPage.jsx
import React from 'react';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const FaqItem = ({ question, answer }) => (
  <div className="bg-dark-secondary/50 p-4 rounded-lg">
    <h3 className="font-semibold text-text-primary mb-2">{question}</h3>
    <p className="text-sm">{answer}</p>
  </div>
);

const FaqPage = () => {
  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
    <StaticPageLayout title="Preguntas Frecuentes (FAQ)">
      <FaqItem
        question="¿Qué es NEURO LINK?"
        answer="NEURO LINK es una plataforma de simulación de minería gamificada que te permite ganar tokens NTX a través de la compra y gestión de herramientas virtuales."
      />
      <FaqItem
        question="¿Cómo puedo aumentar mis ganancias?"
        answer="Puedes aumentar tu tasa de minería comprando herramientas más potentes en la sección 'Mejora'. También puedes ganar bonificaciones invitando a amigos a unirse a tu equipo."
      />
      <FaqItem
        question="¿Qué es el token NTX?"
        answer="NTX es el token nativo de la plataforma NEURO LINK. Lo acumulas a través de la minería y puedes usarlo dentro del ecosistema de la aplicación."
      />
      <FaqItem
        question="¿Cómo funciona el sistema de referidos?"
        answer="Cuando alguien se registra usando tu código de invitación, se une a tu equipo. Ganas un porcentaje de la actividad de minería de los miembros de tu equipo, repartido en varios niveles."
      />
    </StaticPageLayout>
   </div> 
  );
};

export default FaqPage;