import React, { useMemo } from 'react';

// Componente Interno para los cuadros de estadísticas
const StatBox = ({ emoji, label, value, color = '#333' }) => (
  <div style={styles.statBox}>
    <span style={{ fontSize: '18px' }}>{emoji}</span>
    <span style={{ fontSize: '14px', flex: 1, marginLeft: '8px', color: '#333' }}>{label}:</span>
    <strong style={{ fontSize: '16px', color }}>{value}</strong>
  </div>
);

const SesionesList = ({ sesiones, onDeleteSession, onEditSession, onSelectSession, onTareaClick }) => {
  
  const hoy = new Date();
  const hoy1 = hoy.toISOString().split('T')[0];

  // Cálculos de estadísticas para el resumen lateral
  const stats = useMemo(() => {
    if (!sesiones) return null;
    const totalTareas = sesiones.reduce((acc, s) => acc + (s.tareas?.length || 0), 0);
    const completadas = sesiones.reduce((acc, s) => acc + (s.tareas?.filter(t => t.es_completada).length || 0), 0);
    const duracionMinutos = sesiones.reduce((acc, s) => acc + (s.tareas?.reduce((tAcc, t) => tAcc + (Number(t.duracion_estimada) || 0), 0) || 0), 0);

    return {
      totalSesiones: sesiones.length,
      totalTareas: totalTareas,
      completadas: completadas,
      pendientes: totalTareas - completadas,
      horasTotales: (duracionMinutos / 60).toFixed(1)
    };
  }, [sesiones]);

  if (!sesiones || sesiones.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
        <p>No hay sesiones de estudio registradas.</p>
      </div>
    );
  }

  return (
    <div style={styles.mainLayout}>
      
      {/* SECCIÓN IZQUIERDA: LISTADO */}
      <div style={styles.listSection}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>📂 Listado de Sesiones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {sesiones.map((sesion) => {
            const esVencida = sesion.fecha_examen < hoy1;

            return (
              <div key={sesion.id} style={styles.sessionGroup}>
                <div 
                  style={{
                    ...styles.cardBase,
                    borderLeft: esVencida ? '5px solid #6c757d' : '5px solid #007bff',
                    opacity: esVencida ? 0.9 : 1,
                  }}
                  onClick={() => onSelectSession && onSelectSession(sesion)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                        {esVencida ? '📁' : '📖'} {sesion.nombre}
                      </h4>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        <strong>📅 Examen:</strong> {new Date(sesion.fecha_examen + "T12:00:00").toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={styles.buttonGroup}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditSession?.(sesion); }}
                          style={styles.btnAction}
                        >✏️</button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteSession(sesion.id, sesion.nombre); }}
                          style={{ ...styles.btnAction, color: '#dc3545' }}
                        >🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.taskContainer}>
                  {sesion.tareas && sesion.tareas.length > 0 ? (
                    sesion.tareas.map((tarea) => (
                      <div 
                        key={tarea.id} 
                        style={styles.taskItem}
                        onClick={() => onTareaClick && onTareaClick(tarea, sesion)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>{tarea.es_completada ? '✅' : '📝'}</span>
                          <span style={{ fontSize: '14px', color: '#444' }}>{tarea.nombre}</span>
                        </div>
                        <span style={styles.taskTime}>{tarea.duracion_estimada} min</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.noTasks}>Sin tareas asignadas</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN DERECHA: RESUMEN */}
      <aside style={styles.statsSection}>
        <div style={styles.resumenCard}>
          <h3 style={styles.resumenTitle}>📊 Resumen General</h3>
          <div style={styles.divider} />
          <h4 style={styles.subTitle}>📈 Estadísticas Totales</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <StatBox emoji="📚" label="Total sesiones" value={stats.totalSesiones} />
            <StatBox emoji="📝" label="Total tareas" value={stats.totalTareas} />
            <StatBox emoji="✅" label="Completadas" value={stats.completadas} color="#28a745" />
            <StatBox emoji="⏳" label="Pendientes" value={stats.pendientes} color="#ffc107" />

            <div style={styles.tiempoBox}>
              <span style={{ fontSize: '20px' }}>⏱️</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#333' }}>Tiempo total:</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '18px' }}>{stats.horasTotales}</div>
                  <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '13px' }}>horas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

    </div>
  );
};

const styles = {
  mainLayout: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: '20px',
    padding: '10px',
    alignItems: 'flex-start'
  },
  listSection: {
    flex: '1 1 500px', 
  },
  statsSection: {
    flex: '1 1 300px', 
  },
  sessionGroup: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  cardBase: {
    padding: '15px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    transition: 'background 0.2s',
  },
  taskContainer: {
    backgroundColor: '#fdfdfd',
    borderTop: '1px solid #eee',
    padding: '5px 0'
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 15px 8px 35px',
    cursor: 'pointer',
    borderBottom: '1px solid #f9f9f9',
  },
  taskTime: { fontSize: '12px', color: '#888', fontWeight: 'bold' },
  noTasks: { padding: '10px 35px', fontSize: '12px', color: '#999', fontStyle: 'italic' },
  btnAction: { background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' },
  buttonGroup: { display: 'flex', gap: '5px' },
  
 
  resumenCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #eee',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  resumenTitle: { fontSize: '18px', margin: '0 0 10px 0', color: '#444' },
  divider: { height: '2px', backgroundColor: '#007bff', marginBottom: '12px' },
  subTitle: { fontSize: '15px', color: '#007bff', margin: '0 0 15px 0', fontWeight: '500' },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #f0f0f0'
  },
  tiempoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#e7f3ff',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #007bff',
    marginTop: '10px'
  }
};

export default SesionesList;