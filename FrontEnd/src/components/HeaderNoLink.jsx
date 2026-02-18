import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

const Title = "Optimizador de Estudio";

//Gestión de hipervinculos
const mainNavLinks = [
  { path: '/Crear-sesion', label: 'Crear Sesión' },
  { path: '/gestor-estudio', label: 'Listado de sesiones' },
];
const authNavLinks = [
  { path: '/', label: 'Inicio' },
];

const HeaderNoLink = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('UserId');
    navigate('/');
    console.log('Sesión cerrada.');
  };

  //Lógica de ubicación por URL
  const currentPath = location.pathname.toLowerCase();
  const isLoginPage = currentPath === '/login' || currentPath.endsWith('/login');
  const isRegisterPage = currentPath === '/register' || currentPath.endsWith('/register');
  const isHomePage = currentPath === '/' || currentPath === ''; 
  const linksToRender = (isLoginPage || isRegisterPage || isHomePage) ? authNavLinks : mainNavLinks;

//Lógica de LogOut
  const shouldShowLogoutButton = !(isLoginPage || isRegisterPage || isHomePage);

  return (
    <header className="header">
      <div className="Links">
        <div className="Encabezado">  
        <div className='Contenedor-boton'>
            {shouldShowLogoutButton && (
              <button 
                className="ButtonLogout"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            )}
        </div>
        <div className="Contenedor-Title">
          <h1>{Title}</h1>
        </div>
        </div> 
        
        

        <nav>
          <div className='Links-Nav'>
            {linksToRender
              .filter(link => {
                  const linkPath = link.path.toLowerCase();
                  return linkPath !== currentPath && !(linkPath === '/' && isHomePage);
              }) 
              .map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className="Links-Nav-item"
                  style={{ color: 'white', textDecoration: 'none', margin: '0 10px' }}
                > 
                  {link.label}
                </Link>
              ))
            }
          </div>
        </nav>
      </div>
    </header>
  );
};

export default HeaderNoLink;