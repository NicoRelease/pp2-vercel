// components/HeaderNavegacion.jsx
import React from 'react';

const HeaderNavegacion = ({ vistaActual, onCambiarVista }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginBottom: '30px',
      borderBottom: '2px solid #e0e0e0',
      paddingBottom: '20px'
    }}>
      <button
        onClick={() => onCambiarVista('sesiones')}
        style={{
          backgroundColor: vistaActual === 'sesiones' ? '#4c545eff' : '#f8f9fa',
          color: vistaActual === 'sesiones' ? 'white' : '#333',
          border: '1px solid #4c545eff',
          padding: '12px 24px',
          cursor: 'pointer',
          borderRadius: '5px 0 0 5px',
          fontWeight: 'bold',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          minWidth: '200px'
        }}
      >
        📚 Vista por Sesiones
      </button>
      <button
        onClick={() => onCambiarVista('fechas')}
        style={{
          backgroundColor: vistaActual === 'fechas' ? '#4c545eff' : '#f8f9fa',
          color: vistaActual === 'fechas' ? 'white' : '#333',
          border: '1px solid #4c545eff',
          padding: '12px 24px',
          cursor: 'pointer',
          borderRadius: '0 5px 5px 0',
          fontWeight: 'bold',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          minWidth: '200px'
        }}
      >
        📅 Vista por Fechas
      </button>
    </div>
  );
};

export default HeaderNavegacion;
