import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import HeaderNoLink from './HeaderNoLink';

const NewSessionForm = ({ onSesionCreada }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: localStorage.getItem('UserId') || null,
    nombre: '',
    fecha_examen: '',
    duracion_diaria_estimada: 60,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); 

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // --- LÓGICA DE FECHAS LOCALES ---
  
  // Mantiene el formato YYYY-MM-DD para el atributo 'min' del input técnico
  const obtenerFechaMinimaISO = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Convierte YYYY-MM-DD al formato del navegador (ej: DD/MM/AAAA)
  const formatearFechaLocal = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    const fecha = new Date(year, month - 1, day); 
    return new Intl.DateTimeFormat(navigator.language).format(fecha);
  };

  const fechaMinima = obtenerFechaMinimaISO();
  // --------------------------------

  const handleChange = (e) => {
    const name = e.target.name;
    const value = name === 'duracion_diaria_estimada' 
      ? parseInt(e.target.value) || 0 
      : e.target.value;
      
    setFormData({ ...formData, [name]: value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null); 
    
    if (formData.duracion_diaria_estimada < 10) {
      setError("La duración diaria debe ser de al menos 10 minutos.");
      setLoading(false);
      return;
    }

    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        setError("No autorizado. Token no encontrado. Por favor, inicia sesión.");
        setLoading(false);
        return;
    }

    try {
      const config = {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
          }
      };
      
      const response = await axios.post(`${API_BASE_URL}/sesiones`, formData, config);

      let mensajeExito = 'Sesión creada exitosamente!';
      
      if (response.data.sesion) {
        const nombreSesion = response.data.sesion.nombre;
        const tareasCreadas = response.data.tareasCreadas || response.data.sesion.tareas?.length || 0;
        const totalMinutos = response.data.sesion.duracion_total_estimada;
        mensajeExito = `✅ Sesión '${nombreSesion}' (${totalMinutos} min total) planificada con éxito! Se crearon ${tareasCreadas} tareas.`;
      } else if (response.data.nombre) {
        mensajeExito = `✅ Sesión '${response.data.nombre}' creada exitosamente!`;
      }
      
      setSuccessMessage(mensajeExito);
      
      if (onSesionCreada) {
        onSesionCreada(response.data);
      }

      setFormData({ ...formData, nombre: '', fecha_examen: '', duracion_diaria_estimada: 60 });
      
    } catch (error) {
      console.error("❌ Error al planificar:", error);
      let errorMsg = 'Error al planificar la sesión';
      if (error.response) {
        errorMsg = error.response.data.error || error.response.data.message || errorMsg;
      } else if (error.request) {
        errorMsg = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
      } else {
        errorMsg = error.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Tarjeta-Principal">
      <HeaderNoLink />
      <div style={{ 
        padding: '30px', 
        border: '2px solid gray', 
        margin: '20px auto', 
        borderRadius: '10px', 
        maxWidth: '450px',
        backgroundColor: '#f8f9fa',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ textAlign: 'center', color: '#007bff', marginBottom: '25px' }}>
          Crear Nueva Sesión de Estudio
        </h3>
        
        {successMessage && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb',
            fontWeight: 'bold'
          }}>
            <strong>🎉 Éxito:</strong> {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="nombre" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nombre de la Sesión:
            </label>
            <input 
              type="text" 
              id="nombre" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              required 
              placeholder="Ej: Examen Final de Matemáticas"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="fecha_examen" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Fecha de Examen:
            </label>
            <input 
              type="date" 
              id="fecha_examen" 
              name="fecha_examen" 
              value={formData.fecha_examen} 
              onChange={handleChange} 
              min={fechaMinima}
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }} 
            />
            <small style={{ color: '#666', fontStyle: 'italic', marginTop: '5px', display: 'block' }}>
              {/* Formato local para la sugerencia visual */}
              ⚠️ La fecha mínima permitida es: <strong>{formatearFechaLocal(fechaMinima)}</strong>
            </small>
            {formData.fecha_examen && (
              <small style={{ color: '#007bff', display: 'block', marginTop: '2px' }}>
                Seleccionado: {formatearFechaLocal(formData.fecha_examen)}
              </small>
            )}
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="duracion_diaria_estimada" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Minutos a Estudiar por Día:
            </label>
            <input 
              type="number" 
              id="duracion_diaria_estimada" 
              name="duracion_diaria_estimada" 
              value={formData.duracion_diaria_estimada} 
              onChange={handleChange} 
              min="10" 
              max="300" 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
                  width: '100%',
                  padding: '15px',
                  backgroundColor: loading ? '#6c757d' : 'gray',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
               }}>
              {loading ? '⏳ Planificando...' : 'Crear Sesión'} 
          </button>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px', fontSize: '14px', color: '#0066cc' }}>
            <strong>💡 Información:</strong>
            <p style={{ margin: '5px 0' }}>
              El sistema creará automáticamente tareas diarias desde hoy hasta la fecha del examen.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSessionForm;