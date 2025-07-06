import React from 'react';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const AboutPage = () => (
  <div className="flex flex-col h-full space-y-6 animate-fade-in">
  <StaticPageLayout title="Sobre nosotros">
    <div className="space-y-4">
      <p>Somos un equipo apasionado por la tecnología blockchain y las finanzas descentralizadas. Nuestra misión con NEURO LINK es crear una puerta de entrada accesible y divertida al mundo de las criptomonedas.</p>
      <p>Creemos que el aprendizaje debe ser una experiencia atractiva, y hemos diseñado esta plataforma para simular los conceptos de minería y recompensas de una manera sencilla y visual.</p>
    </div>
  </StaticPageLayout>
  </div>
);

export default AboutPage;