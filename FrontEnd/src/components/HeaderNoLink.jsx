import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

const Title = "Gestioná tu tiempo";

//Gestión de hipervinculos
const mainNavLinks = [
  { path: '/Crear-sesion', label: 'Crear Sesión' },
  { path: '/gestor-estudio', label: 'Listado de sesiones' },
  { path: '/grupo-resumen', label: 'Listado de grupo' },
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
    
  };

  //Lógica de ubicación por URL
  const currentPath = location.pathname.toLowerCase();
  const isLoginPage = currentPath === '/login' || currentPath.endsWith('/login');
  const isRegisterPage = currentPath === '/register' || currentPath.endsWith('/register');
  const isAdminDashboard = currentPath === '/admin-dashboard' || currentPath.endsWith('/admin-dashboard');
  const isGroupAdmin = currentPath === '/group-admin' || currentPath.endsWith('/group-admin');
  const isOnGestorEstudio = currentPath === '/gestor-estudio' || currentPath.endsWith('/gestor-estudio');
  const isHomePage = currentPath === '/' || currentPath === ''; 

  // Determinar qué links mostrar según la página actual
  let linksToRender;
  if (isHomePage || isLoginPage || isRegisterPage || isAdminDashboard || isGroupAdmin) {
    // Para la página de inicio, login, register, admin-dashboard y group-admin, no mostramos links
    linksToRender = authNavLinks;
  } else {
    // Para todas las demás páginas, mostramos los links normales
    linksToRender = mainNavLinks;
  }

  // Lógica para mostrar el botón de cerrar sesión
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