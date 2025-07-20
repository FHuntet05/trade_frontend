// frontend/src/components/team/SocialShare.jsx
import React from 'react';
import { FaXTwitter, FaFacebookF, FaLinkedinIn, FaWhatsapp, FaInstagram, FaTiktok, FaTelegram } from 'react-icons/fa6';
import { HiOutlineVideoCamera } from 'react-icons/hi2';

const SocialShare = ({ referralLink }) => {
  // El texto que se compartirá junto al enlace. Lo codificamos para que sea seguro en una URL.
  const shareText = encodeURIComponent('¡Ven y forma tu equipo y ganemos dinero juntos! Mi enlace:');

  const socialPlatforms = [
    { name: 'X', icon: FaXTwitter, url: `https://twitter.com/intent/tweet?url=${referralLink}&text=${shareText}`, color: 'hover:text-[#000000] hover:bg-white' },
    { name: 'Facebook', icon: FaFacebookF, url: `https://www.facebook.com/sharer/sharer.php?u=${referralLink}`, color: 'hover:text-white hover:bg-[#1877F2]' },
    { name: 'Telegram', icon: FaTelegram, url: `https://t.me/share/url?url=${referralLink}&text=${shareText}`, color: 'hover:text-white hover:bg-[#26A5E4]' },
    { name: 'LinkedIn', icon: FaLinkedinIn, url: `https://www.linkedin.com/shareArticle?mini=true&url=${referralLink}&title=Únete a NEURO LINK`, color: 'hover:text-white hover:bg-[#0A66C2]' },
    { name: 'WhatsApp', icon: FaWhatsapp, url: `https://api.whatsapp.com/send?text=${shareText} ${referralLink}`, color: 'hover:text-white hover:bg-[#25D366]' },
    { name: 'Instagram', icon: FaInstagram, url: `https://www.instagram.com`, color: 'hover:text-white hover:bg-gradient-to-r from-purple-500 to-pink-500' },
    { name: 'TikTok', icon: FaTiktok, url: `https://www.tiktok.com`, color: 'hover:text-white hover:bg-[#000000]' },
    { name: 'Video', icon: HiOutlineVideoCamera, url: `#`, color: 'hover:text-white hover:bg-red-600' }
  ];

  return (
    <div className="w-full mt-6">
      <h3 className="text-sm font-semibold text-text-secondary mb-3">Compartir en</h3>
      <div className="flex items-center justify-between overflow-x-auto space-x-3 pb-2">
        {socialPlatforms.map(({ name, icon: Icon, url, color }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            // Estilo del círculo del icono
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-white/30 text-white/80 transition-all duration-300 ${color}`}
          >
            <Icon size={20} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialShare;