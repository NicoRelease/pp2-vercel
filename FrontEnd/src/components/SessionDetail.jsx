import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtén la tarea del estado de navegación
  const tarea = location.state?.tarea;

  if (!tarea) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '50px' }}>
        <h2>❌ No se pudieron cargar los detalles</h2>
        <p>Por favor, accede a esta página desde el listado de sesiones.</p>
        <button 
          onClick={() => navigate('/sesiones')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Volver al Listado
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          marginBottom: '20px', 
          padding: '10px 15px', 
          backgroundColor: '#6c757d', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Volver al Listado
      </button>

      <h2>📋 Detalles de la Tarea: {tarea.nombre}</h2>
      
      <div style={{ 
        border: '2px solid #007bff', 
        padding: '20px', 
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>Información General</h3>
        <p><strong>Nombre:</strong> {tarea.nombre}</p>
        <p><strong>Nivel de Dificultad:</strong> {tarea.dificultad_nivel}</p>
        <p><strong>Tiempo Requerido:</strong> {(tarea.tiempo_total_requerido / 60).toFixed(1)} horas</p>
        <p><strong>Tiempo Consumido:</strong> {(tarea.tiempo_total_consumido / 60).toFixed(1)} horas</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Sesiones Planificadas ({tarea.sesiones.length})</h3>
        {tarea.sesiones && tarea.sesiones.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tarea.sesiones.map((sesion) => (
              <li key={sesion.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                margin: '10px 0', 
                borderRadius: '5px',
                backgroundColor: sesion.es_completada ? '#d4edda' : '#fff3cd'
              }}>
                <p><strong>Fecha Programada:</strong> {sesion.fecha_programada}</p>
                <p><strong>Duración Estimada:</strong> {sesion.duracion_estimada} minutos</p>
                <p><strong>Estado:</strong> {sesion.es_completada ? '✅ Completada' : '⏳ Pendiente'}</p>
                {sesion.es_completada && (
                  <p><strong>Feedback de Dominio:</strong> {sesion.feedback_dominio}</p>
                )}
                <p><strong>Tiempo Real de Ejecución:</strong> {Math.floor(sesion.tiempo_real_ejecucion / 60)} minutos</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay sesiones planificadas para esta tarea.</p>
        )}
      </div>
    </div>
  );
};

export default SessionDetail;
