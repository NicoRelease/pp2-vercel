import React, { useMemo } from 'react';
import Conversion from './Conversion';

// Componente Interno para los cuadros de estadísticas
const StatBox = ({ emoji, label, value, color = '#333' }) => (
  <div style={styles.statBox}>
    <span style={{ fontSize: '18px' }}>{emoji}</span>
    <span style={{ fontSize: '14px', flex: 1, marginLeft: '8px', color: '#333' }}>{label}:</span>
    <strong style={{ fontSize: '16px', color }}>{value}</strong>
  </div>
);

const TareasPorFecha = ({ sesiones, onTareaClick, onDeleteTarea, onGestionarTarea }) => {
  
  // 📌 Definir la fecha de hoy para la comparación
  const hoy = new Date();
  const hoy1 = hoy.toISOString().split('T')[0];

  // ============================================================
  // 📌 AGRUPAR TAREAS POR FECHA (Lógica original conservada)
  // ============================================================
  const agruparTareasPorFecha = () => {
    if (!sesiones || sesiones.length === 0) return {};

    const agrupado = {};

    sesiones.forEach(sesion => {
      const tareas = sesion.tareas || [];
      
      tareas.forEach(tarea => {
        const fecha = tarea.fecha_programada;
        if (!agrupado[fecha]) {
          agrupado[fecha] = [];
        }
        agrupado[fecha].push({
          ...tarea,
          sesionPadre: {
            id: sesion.id,
            nombre: sesion.nombre,
            fecha_examen: sesion.fecha_examen
          }
        });
      });
    });

    const fechasOrdenadas = Object.keys(agrupado).sort();
    const objetoOrdenado = {};
    fechasOrdenadas.forEach(fecha => {
      objetoOrdenado[fecha] = agrupado[fecha];
    });

    return objetoOrdenado;
  };

  const tareasPorFecha = agruparTareasPorFecha();
  const fechas = Object.keys(tareasPorFecha);

  // 📌 CÁLCULO DE ESTADÍSTICAS PARA EL RESUMEN
  const stats = useMemo(() => {
    let total = 0;
    let completadas = 0;
    let duracionMinutos = 0;

    fechas.forEach(f => {
      const lista = tareasPorFecha[f];
      total += lista.length;
      completadas += lista.filter(t => t.es_completada).length;
      duracionMinutos += lista.reduce((acc, t) => acc + (Number(t.duracion_estimada) || 0), 0);
    });

    return {
      totalFechas: fechas.length,
      totalTareas: total,
      completadas: completadas,
      pendientes: total - completadas,
      horasTotales: (duracionMinutos / 60).toFixed(1)
    };
  }, [tareasPorFecha, fechas]);

  if (fechas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
        <p>No hay tareas planificadas para ninguna fecha.</p>
      </div>
    );
  }

  return (
    <div style={styles.mainLayout}>
      
      {/* SECCIÓN IZQUIERDA: LISTADO POR FECHA */}
      <div style={styles.listSection}>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>🗓️ Tareas Organizadas por Fecha</h3>

        {fechas.map((fecha) => {
          const esFechaPasada = fecha < hoy1;
          const tareas = tareasPorFecha[fecha];

          return (
            <div key={fecha} style={styles.dateSection}>
              <div style={{
                ...styles.dateHeader,
                borderBottom: esFechaPasada ? '2px solid #6c757d' : '2px solid #28a745'
              }}>
                <h4 style={{ margin: 0, color: esFechaPasada ? '#6c757d' : '#28a745' }}>
                  📅 {new Date(fecha + "T12:00:00").toLocaleDateString('es-ES', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </h4>
                {esFechaPasada && <span style={styles.badgeVencido}>Día pasado</span>}
              </div>

              <div style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
                {tareas.map((tarea) => {
                  const bloqueada = esFechaPasada && !tarea.es_completada;

                  return (
                    <div
                      key={tarea.id}
                      style={{
                        ...styles.taskCard,
                        backgroundColor: tarea.es_completada ? '#f8fff8' : (bloqueada ? '#f9f9f9' : '#fff'),
                        opacity: bloqueada ? 0.7 : 1,
                        cursor: bloqueada ? 'not-allowed' : 'pointer',
                        borderLeft: tarea.es_completada ? '4px solid #28a745' : (bloqueada ? '4px solid #6c757d' : '4px solid #ffc107')
                      }}
                      onClick={() => (!bloqueada || tarea.es_completada) && onTareaClick(tarea, tarea.sesionPadre)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>
                            {tarea.es_completada ? '✅' : (bloqueada ? '⏰' : '📝')} {tarea.nombre}
                          </h5>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            <strong>📚 Sesión:</strong> {tarea.sesionPadre.nombre}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '100px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{tarea.duracion_estimada} min</div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: tarea.es_completada ? '#28a745' : '#888',
                            marginTop: '4px'
                          }}>
                            {tarea.es_completada ? `Real: ${Conversion(tarea.tiempo_real_ejecucion)}` : (bloqueada ? 'Vencida' : 'Pendiente')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteTarea(tarea.id, tarea.nombre, e); }}
                          style={styles.btnDelete}
                        >🗑️ Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECCIÓN DERECHA: RESUMEN RESPONSIVO */}
      <aside style={styles.statsSection}>
        <div style={styles.resumenCard}>
          <h3 style={styles.resumenTitle}>📊 Resumen General</h3>
          <div style={styles.divider} />
          <h4 style={styles.subTitle}>📈 Estadísticas Totales</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <StatBox emoji="📅" label="Días con tareas" value={stats.totalFechas} />
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
    gap: '25px',
    padding: '10px'
  },
  listSection: { flex: '1 1 500px' },
  statsSection: { flex: '1 1 300px' },
  dateSection: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #f0f0f0' },
  dateHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '10px' },
  badgeVencido: { backgroundColor: '#eee', color: '#666', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  taskCard: { padding: '12px', borderRadius: '6px', border: '1px solid #eee', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  btnDelete: { backgroundColor: 'transparent', color: '#6c757d', border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
  
  // Estilos del Resumen
  resumenCard: { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: 'fit-content', position: 'sticky', top: '20px' },
  resumenTitle: { fontSize: '18px', margin: '0 0 10px 0', color: '#444' },
  divider: { height: '2px', backgroundColor: '#007bff', marginBottom: '12px' },
  subTitle: { fontSize: '15px', color: '#007bff', margin: '0 0 15px 0', fontWeight: '500' },
  statBox: { display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #f0f0f0' },
  tiempoBox: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#e7f3ff', padding: '12px 15px', borderRadius: '8px', border: '1px solid #007bff', marginTop: '10px' }
};

export default TareasPorFecha;