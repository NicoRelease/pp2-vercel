import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // ⬅️ Agregamos useNavigate


/**
 * Componente de encabezado de la aplicación con enlaces de navegación y botón de cierre de sesión.
 * Resalta el enlace activo usando useLocation.
 */
const HeaderInicio = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ⬅️ Inicializamos useNavigate

  // Estilos base para todos los enlaces
  const baseLinkStyle = {
    color: 'white',
    margin: '0 15px', // Ajustado ligeramente para dejar espacio al botón de logout
    textDecoration: 'none',
    fontWeight: 'normal',
    padding: '5px 10px',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  };

  // Estilo para el enlace activo
  const activeLinkStyle = {
    ...baseLinkStyle,
    fontWeight: 'bold',
    backgroundColor: '#0056b3', // Un azul más oscuro para resaltar
  };
    const Title = "Optimizador de Estudio";

  return (
    <header style={{ 
      backgroundColor: '#4c545eff', 
      color: 'white', 
      padding: '15px', 
      textAlign: 'center', 
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex', // Usamos flexbox para centrar y distribuir mejor
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Contenedor del Título y Navegación */}
      <div style={{ flexGrow: 1, textAlign: 'left' }}> 
        <h1 style={{ marginBottom: '15px', fontSize: '2em', paddingLeft: '15px' }}>
          {Title}
        </h1>
        <nav>
          <div style={{ flexGrow: 1, textAlign: 'centered' }}>

          </div>
          
        </nav>

      </div>
      
    </header>
  );
};

export default HeaderInicio;