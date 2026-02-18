import { useNavigate } from 'react-router-dom';
import '../App.css';
import HeaderNoLink from './HeaderNoLink';

export default function Home() {
  const navigate = useNavigate();

  return (
    // Contenedor principal: Ocupa toda la altura y tiene el fondo.
    <div className= "Tarjeta-Principal">
       {/* Título - SIN DIV ADICIONAL */}
       <HeaderNoLink />
        

      {/* Contenedor de Centrado: Simplificado para depender solo de items-center */}
      <div className="Imagen">
        
       

        <img
          src="../FrontEnd/Home.jpg"
          alt="Imagen Home"
          className="shadow-lg mb-6 w-full max-w-sm h-auto object-cover"
        />
        
        
        
        {/* Párrafo - SIN DIV ADICIONAL */}
        <p className="Parrafo-Home">
          Explota tu potencial, maximiza tu tiempo. Puedes ingresar para acceder a tu cuenta.
        </p>
        
        {/* Botón - SIN DIV ADICIONAL */}
        <button
          onClick={() => navigate("/Login")}
          // CLASES PARA EL EFECTO 3D (ver sección 2)
          className="px-8 py-3 bg-blue-600 text-black rounded-xl shadow-lg hover:bg-blue-700 active:translate-y-0.5 active:shadow-md transition duration-150 ease-in-out w-full sm:w-auto max-w-xs"
        >
          Ingresar
        </button>
        
      </div>
    </div>
  );
}