import React from 'react';
import { useNavigate } from 'react-router-dom';

const WaitingRoom = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Cuenta en revisión</h1>
            <p className="text-gray-600 mb-6">Tu registro fue exitoso, pero un administrador debe activarte o asignarte a un grupo para continuar.</p>
            <button 
                onClick={() => navigate('/Login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Volver al Login
            </button>
        </div>
    );
};
export default WaitingRoom;