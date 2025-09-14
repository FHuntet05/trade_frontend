import React from 'react';
import { HiOutlineBars3 } from 'react-icons/hi2';

const AdminHeaderMobile = ({ title, onMenuClick }) => {
    return (
        <header className="md:hidden bg-dark-secondary p-4 flex justify-between items-center border-b border-white/10 sticky top-0 z-10">
            <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-white/10">
                <HiOutlineBars3 className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
            <div className="w-8 h-8"></div> {/* Espaciador para centrar el título */}
        </header>
    );
};

export default AdminHeaderMobile;