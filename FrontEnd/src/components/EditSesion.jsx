import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderNoLink from './HeaderNoLink';

const EditSesion = ({ sesion, onSaved, onCancel }) => {
  // Inicializar estado con datos existentes
  const [formData, setFormData] = useState({
    nombre: sesion.nombre || '',
    fecha_examen: sesion.fecha_examen ? sesion.fecha_examen.substring(0, 10) : new Date().toISOString().substring(0, 10),
    duracion_total_estimada: sesion.duracion_total_estimada || 60, // En minutos
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Estados para el recálculo y visualización de métricas
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [tiempoDiarioEstimado, setTiempoDiarioEstimado] = useState(0);
  const [ritmoActualMinutoDia, setRitmoActualMinutoDia] = useState(null);

  // Calcular ritmo inicial al montar o cambiar fecha/duración significativamente
  useEffect(() => {
    if (sesion.fecha_examen && sesion.duracion_total_estimada) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDate = new Date(sesion.fecha_examen);
      const diffTime = examDate - today;
      const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0) {
        const ritmoInicial = sesion.duracion_total_estimada / daysDiff;
        setRitmoActualMinutoDia(ritmoInicial);
      }
    }
  }, [sesion]);

  // Recalcular métricas cada vez que cambie fecha o duración
  useEffect(() => {
    if (formData.fecha_examen && formData.duracion_total_estimada) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const examDate = new Date(formData.fecha_examen);
      const diffTime = examDate - today;
      const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setDiasRestantes(daysDiff);

      if (daysDiff > 0) {
        const dailyMinutes = formData.duracion_total_estimada / daysDiff;
        setTiempoDiarioEstimado(dailyMinutes.toFixed(1));
      } else if (daysDiff === 0) {
        setTiempoDiarioEstimado(formData.duracion_total_estimada); 
      } else {
        setTiempoDiarioEstimado(Infinity);
      }
    }
  }, [formData.fecha_examen, formData.duracion_total_estimada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'fecha_examen') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        
        // Validación: fecha no puede ser menor a la actual
        if (selectedDate < today) {
            setError("La fecha no puede ser anterior al día de hoy.");
            return;
        }

        const diffTime = selectedDate - today;
        const newDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (newDays > 0) {
            // Recálculo automático: Mantener ritmo constante de estudio
            // Si es la primera vez que se calcula el ritmo, usamos los datos originales de la sesión
            const baseRitmo = ritmoActualMinutoDia || (formData.duracion_total_estimada / Math.max(1, diasRestantes));
            
            // Nuevo Total = Ritmo Base * Nuevos Días
            const newDuration = Math.round(baseRitmo * newDays);
            
            setFormData(prev => ({ ...prev, [name]: value, duracion_total_estimada: newDuration }));
            setError(null);
        } else {
            // Si es hoy mismo (0 días restantes), la duración mínima es lo que queda del día o se ajusta a 0 si ya pasó
            setFormData(prev => ({ ...prev, [name]: value }));
            setError("Fecha seleccionada es hoy. Se ajustará a carga diaria máxima.");
        }
    } else {
      // Para otros campos (nombre), actualización directa
      if (name === 'duracion_total_estimada') {
          const numVal = Number(value);
          if (numVal < 10) {
              setError("La duración mínima estimada es de 10 minutos.");
              return;
          }
      }
      setFormData({ ...formData, [name]: value });
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación final robusta
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.fecha_examen);

    if (selectedDate < today) {
      setError("La fecha seleccionada es inválida (no puede ser en el pasado).");
      return;
    }
    
    // Validar que la duración no sea menor a un umbral seguro dado los días restantes
    if (diasRestantes > 0 && formData.duracion_total_estimada < diasRestantes * 5) {
        setError("La duración estimada es muy baja para la cantidad de días disponibles.");
        return;
    }

    setLoading(true);
    setSuccessMessage(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) throw new Error("No autorizado");

      // Enviamos los datos recalculados al backend
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/sesiones/${sesion.id}`, formData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      setSuccessMessage('Sesión actualizada y tiempos recalculados correctamente');
      
      // Callback para notificar al padre y cerrar el modal/actualizar lista
      setTimeout(() => onSaved(sesion.id), 1500); 
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Tarjeta-Principal">
      <HeaderNoLink />
      
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '25px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#007bff', marginBottom: '20px' }}>Editar Sesión y Recalcular Plan</h3>

        {successMessage && (
            <div className="alert alert-success" style={{color:'green', backgroundColor:'#d4edda', padding:'10px', borderRadius:'5px', marginBottom:'15px'}}>
                ✅ {successMessage}
            </div>
        )}
        
        {error && (
            <div className="alert alert-danger" style={{color: '#721c24', backgroundColor:'#f8d7da', padding:'10px', borderRadius:'5px', marginBottom:'15px'}}>
                ⚠️ {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Nombre */}
          <div style={{ marginBottom: '20px' }}>
            <label><strong>Nombre de la Sesión:</strong></label>
            <input 
              type="text" name="nombre" value={formData.nombre} onChange={handleChange} 
              required className="form-control" 
              style={{width:'100%', padding:'10px', marginTop: '5px', borderRadius:'4px', border:'1px solid #ccc'}} 
            />
          </div>

          {/* Campo Fecha Examen */}
          <div style={{ marginBottom: '20px' }}>
            <label><strong>Fecha del Examen:</strong></label>
            <input 
              type="date" name="fecha_examen" value={formData.fecha_examen} onChange={handleChange} 
              required className="form-control" min={new Date().toISOString().substring(0,10)}
              style={{width:'100%', padding:'10px', marginTop: '5px', borderRadius:'4px', border:'1px solid #ccc'}} 
            />
          </div>

          {/* Panel de Recálculo Informativo */}
          <div style={{ marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
             <h6 style={{marginBottom:'10px'}}>📊 Recálculo Automático de Planificación:</h6>
             
             <p style={{margin:'5px 0', fontSize:'0.9rem'}}><strong>Días restantes hasta el examen:</strong> {diasRestantes > 0 ? diasRestantes : 0}</p>
             
             {diasRestantes > 0 && (
                 <>
                    <div style={{ marginBottom: '15px' }}>
                        <label><strong>Tiempo Total Estimado (minutos):</strong></label>
                        {/* Input editable pero que se ajusta si cambia la fecha */}
                         <input 
                            type="number" name="duracion_total_estimada" value={formData.duracion_total_estimada} onChange={handleChange} 
                            min="10" required className="form-control" 
                            style={{width:'100%', padding:'8px', marginTop: '5px', borderRadius:'4px', border:'1px solid #ccc'}} 
                        />
                    </div>
                    
                    <p style={{color: diasRestantes < 3 ? '#dc3545' : '#28a745', fontWeight: 'bold', fontSize: '1.1rem'}}>
                        🕒 Carga diaria necesaria: {tiempoDiarioEstimado} min/día
                    </p>
                    <small style={{color:'#6c757d', display:'block', marginTop:'5px'}}>
                        ℹ️ Al modificar la fecha, el sistema recalcula automáticamente el tiempo total para mantener un ritmo constante de estudio y ajustar la cantidad de tareas necesarias.
                    </small>
                 </>
             )}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading || successMessage || diasRestantes <= 0} className="btn btn-primary" 
                style={{padding:'10px 20px', borderRadius:'5px', border:'none', background: diasRestantes <= 0 ? '#ccc' : '#007bff', color:'#fff'}}>
              {loading ? 'Guardando...' : 'Guardar y Recalcular'}
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary" 
                style={{padding:'10px 20px', borderRadius:'5px', border:'none', background:'#6c757d', color:'#fff'}}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSesion;
