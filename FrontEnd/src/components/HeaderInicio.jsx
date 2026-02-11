import React from 'react';
import '../App.css';
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
    <header>
      
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