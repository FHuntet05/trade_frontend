import React from 'react';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const SupportPage = () => (
   <div className="flex flex-col h-full space-y-6 animate-fade-in">
  <StaticPageLayout title="Atención al Cliente">
    <div className="space-y-4">
      <p>Si tienes algún problema, duda o sugerencia, no dudes en contactarnos. Nuestro equipo de soporte está aquí para ayudarte.</p>
      <div>
        <h3 className="font-semibold text-text-primary mb-1">Canal de Telegram</h3>
        <a href="https://t.me/Jjavaa5" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          @t.me/your_support_channel
        </a>
      </div>
      <div>
        <h3 className="font-semibold text-text-primary mb-1">Correo Electrónico</h3>
        <p>support@neurolink.app</p>
      </div>
    </div>
    
  </StaticPageLayout>
  </div>
);

export default SupportPage;