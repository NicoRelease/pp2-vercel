import React from 'react';
import { useNavigate } from 'react-router-dom';

const WaitingRoom = () => {
    const navigate = useNavigate();
    return (
        <div className="waiting-room-container">
            <h1 className="waiting-room-title">Cuenta en revisión</h1>
            <p className="waiting-room-paragraph">Tu registro fue exitoso, pero un administrador debe activarte o asignarte a un grupo para continuar.</p>
            <button 
                onClick={() => navigate('/Login')}
                className="waiting-room-button"
            >
                Volver al Login
            </button>
        </div>
    );
};
export default WaitingRoom;
