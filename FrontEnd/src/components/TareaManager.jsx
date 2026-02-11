import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import HeaderNoLink from './HeaderNoLink';
import '../App.css';

const TareaManager = () => {
  const { tareaId } = useParams();
  const navigate = useNavigate();
  
  const [tarea, setTarea] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estaActiva, setEstaActiva] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const autosaveIntervalRef = useRef(null);

  const getConfig = useCallback(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) { navigate('/Login'); return {}; }
    return { headers: { 'Authorization': `Bearer ${authToken}` } };
  }, [navigate]);

  // --- SINCRO: TRAER DATO MAESTRO DE LA DB ---
  const fetchEstadoActualizado = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/sesiones/tareas/${tareaId}`, getConfig());
      const tiempoDB = res.data.tiempo_real_ejecucion || 0;
      const tiempoLocal = parseInt(localStorage.getItem(`temp_time_${tareaId}`)) || 0;
      
      // El valor más alto gana (protección contra micro-cortes)
      const tiempoFinal = Math.max(tiempoDB, tiempoLocal);
      
      setTarea(res.data);
      setSesion(res.data.sesion);
      setTiempoTranscurrido(tiempoFinal);
      localStorage.setItem(`temp_time_${tareaId}`, tiempoFinal);
    } catch (err) {
      console.error("Error de sincronización:", err);
    }
  }, [tareaId, API_BASE_URL, getConfig]);

  useEffect(() => {
    fetchEstadoActualizado().then(() => setLoading(false));
  }, [fetchEstadoActualizado]);

  // --- CRONÓMETRO (1s) ---
  useEffect(() => {
    let interval = null;
    if (estaActiva) {
      interval = setInterval(() => {
        setTiempoTranscurrido(prev => {
          const nuevo = prev + 1;
          localStorage.setItem(`temp_time_${tareaId}`, nuevo);
          return nuevo;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [estaActiva, tareaId]);

  // --- LÓGICA DE AUTOSAVE (Cada 30s) ---
  useEffect(() => {
    if (estaActiva) {
      autosaveIntervalRef.current = setInterval(() => {
        const tiempoActual = parseInt(localStorage.getItem(`temp_time_${tareaId}`));
        axios.post(`${API_BASE_URL}/sesiones/tareas/${tareaId}/gestionar`, 
          { action: 'pause', tiempo_ejecutado: tiempoActual }, getConfig()
        ).catch(e => console.log("Autosave fallido (sin conexión)"));
      }, 30000); // 30 segundos
    } else {
      clearInterval(autosaveIntervalRef.current);
    }
    return () => clearInterval(autosaveIntervalRef.current);
  }, [estaActiva, tareaId, API_BASE_URL, getConfig]);

  const manejarAccion = async (accion) => {
    if (!tarea) return;

    if (accion === 'start') {
      await fetchEstadoActualizado(); // Sincroniza antes de arrancar
      setEstaActiva(true);
      return;
    }

    // Para PAUSE o STOP
    const tiempoSnapshot = tiempoTranscurrido;
    setEstaActiva(false);

    try {
      const res = await axios.post(`${API_BASE_URL}/sesiones/tareas/${tareaId}/gestionar`, 
        { action: accion, tiempo_ejecutado: tiempoSnapshot }, getConfig()
      );

      if (accion === 'stop') {
        localStorage.removeItem(`temp_time_${tareaId}`);
        navigate('/gestor-estudio');
      } else {
        setTarea(res.data.tarea);
      }
    } catch (err) {
      alert('Error al grabar. El tiempo permanece localmente.');
    }
  };

  const formatTiempo = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const seg = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Sincronizando...</div>;

  return (
    <div className="Tarjeta-Principal" style={styles.page}>
      <HeaderNoLink />
      <div style={styles.mainLayout}>
        
        {/* COLUMNA IZQUIERDA: GESTIÓN */}
        <div style={styles.leftCol}>
          <button onClick={() => navigate('/gestor-estudio')} style={styles.btnBack}>↩️ Volver</button>
          
          <div style={styles.card}>
            <h1 style={styles.taskTitle}>{tarea?.nombre}</h1>
            {tarea?.es_completada && <span style={styles.doneBadge}>✅ Tarea Completada</span>}

            {!tarea?.es_completada && (
              <div style={styles.timerContainer}>
                <div style={styles.clock}>{formatTiempo(tiempoTranscurrido)}</div>
                <div style={styles.btnGroup}>
                  {!estaActiva ? (
                    <button onClick={() => manejarAccion('start')} style={styles.btnStart}>▶️ Iniciar</button>
                  ) : (
                    <button onClick={() => manejarAccion('pause')} style={styles.btnPause}>⏸️ Pausar</button>
                  )}
                  <button onClick={() => manejarAccion('stop')} style={styles.btnStop}>⏹️ Finalizar</button>
                </div>
                <p style={styles.autosaveText}>{estaActiva ? 'Autosave activo (30s)' : 'Sincronizado'}</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (Sticky) */}
        <aside style={styles.rightCol}>
          <div style={styles.resumenCard}>
            <h3 style={styles.resumenTitle}>📊 Resumen General</h3>
            <div style={styles.divider} />
            <div style={styles.infoRow}>
              <span>📚 Sesión:</span>
              <strong>{sesion?.nombre}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>🎯 Objetivo:</span>
              <strong>{tarea?.duracion_estimada} min</strong>
            </div>
            <div style={styles.infoRow}>
              <span>⏱️ Estado:</span>
              <strong style={{color: estaActiva ? '#28a745' : '#666'}}>{estaActiva ? 'En curso' : 'Pausado'}</strong>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f9fa' },
  mainLayout: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px', maxWidth: '1100px', margin: '0 auto', padding: '20px' },
  leftCol: { flex: '1 1 600px' },
  rightCol: { flex: '1 1 300px' },
  btnBack: { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  taskTitle: { fontSize: '24px', color: '#333', marginBottom: '10px' },
  doneBadge: { color: '#28a745', fontWeight: 'bold' },
  timerContainer: { textAlign: 'center', marginTop: '20px' },
  clock: { fontSize: '4.5rem', fontWeight: 'bold', fontFamily: 'monospace', margin: '20px 0', color: '#2c3e50' },
  btnGroup: { display: 'flex', gap: '15px', justifyContent: 'center' },
  btnStart: { backgroundColor: '#28a745', color: 'white', padding: '15px 30px', borderRadius: '10px', border: 'none', fontSize: '18px', flex: 1, cursor: 'pointer' },
  btnPause: { backgroundColor: '#ffc107', color: 'black', padding: '15px 30px', borderRadius: '10px', border: 'none', fontSize: '18px', flex: 1, cursor: 'pointer' },
  btnStop: { backgroundColor: '#dc3545', color: 'white', padding: '15px 30px', borderRadius: '10px', border: 'none', fontSize: '18px', cursor: 'pointer' },
  autosaveText: { fontSize: '12px', color: '#aaa', marginTop: '15px' },
  resumenCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' },
  resumenTitle: { fontSize: '18px', margin: '0 0 10px 0' },
  divider: { height: '3px', backgroundColor: '#007bff', width: '40px', marginBottom: '15px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }
};

export default TareaManager;