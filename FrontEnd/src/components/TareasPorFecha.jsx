// components/TareasPorFecha.jsx
import React from 'react';
import Conversion from './Conversion';

const TareasPorFecha = ({ sesiones, onTareaClick, onDeleteTarea, onGestionarTarea }) => {
  // Función para agrupar tareas por fecha
  const agruparTareasPorFecha = () => {
    if (!sesiones || sesiones.length === 0) return {};

    const todasLasTareas = sesiones.flatMap(sesion => 
      (sesion.tareas || []).map(tarea => ({
        ...tarea,
        sesionPadre: {
          id: sesion.id,
          nombre: sesion.nombre,
          fecha_examen: sesion.fecha_examen
        }
      }))
    );

    const agrupado = {};
    todasLasTareas.forEach(tarea => {
      const fecha = tarea.fecha_programada;
      if (!agrupado[fecha]) {
        agrupado[fecha] = {
          tareas: [],
          totalDuracionEstimada: 0
        };
      }
      agrupado[fecha].tareas.push(tarea);
      agrupado[fecha].totalDuracionEstimada += tarea.duracion_estimada || 0;
    });

    // ✅ ORDENAR POR FECHA ASCENDENTE (de menor a mayor)
    return Object.keys(agrupado)
      .sort((a, b) => new Date(a) - new Date(b)) // ✅ Cambio: orden ascendente
      .reduce((ordenado, fecha) => {
        ordenado[fecha] = agrupado[fecha];
        return ordenado;
      }, {});
  };

  // Calcular resumen general
  const calcularResumenGeneral = () => {
    const tareasPorFecha = agruparTareasPorFecha();
    let totalTareas = 0;
    let totalDuracion = 0;
    let tareasCompletadas = 0;

    Object.values(tareasPorFecha).forEach(grupo => {
      totalTareas += grupo.tareas.length;
      totalDuracion += grupo.totalDuracionEstimada;
      tareasCompletadas += grupo.tareas.filter(t => t.es_completada).length;
    });

    return {
      totalTareas,
      totalDuracion,
      tareasCompletadas,
      tareasPendientes: totalTareas - tareasCompletadas,
      diasConTareas: Object.keys(tareasPorFecha).length
    };
  };

  const tareasPorFecha = agruparTareasPorFecha();
  const resumenGeneral = calcularResumenGeneral();

  const hoy = new Date();
  const hoy1 = hoy.toISOString().split('T')[0];
console.log(`Fecha hoy: ${hoy.toISOString()}`);
console.log(`Fecha hoy1: ${hoy1}`);

// Obtener el año
const año = hoy.getFullYear();

// Obtener el mes (getMonth() devuelve 0-11, así que sumamos 1)
// Usamos padStart(2, '0') para asegurar dos dígitos
const mes = String(hoy.getMonth() + 1).padStart(2, '0');

// Obtener el día del mes
// Usamos padStart(2, '0') para asegurar dos dígitos
const dia = String(hoy.getDate()).padStart(2, '0');

// Concatenar para obtener el formato yyyy-mm-dd
const fechahoyFormateada = `${año}-${mes}-${dia}`;

console.log(`Formato fecha hoy: ${fechahoyFormateada}`);

  if (Object.keys(tareasPorFecha).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>No hay tareas planificadas.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>
      {/* Panel principal - Lista de tareas por fecha */}
      <div style={{ flex: 3 }}>
        <h3 style={{ color: '#333', marginBottom: '25px' }}>📅 Tareas Organizadas por Fecha</h3>
        
        {Object.entries(tareasPorFecha).map(([fecha, grupo]) => {
          // ✅ Verificar si la fecha es pasada
          const fechaString = new Date(fecha);
          const fechaTarea = new Date(`${fechaString}T12:00:00`);
          const año = fechaTarea.getFullYear();

const mes = String(fechaTarea.getMonth() + 1).padStart(2, '0');
const dia = String(fechaTarea.getDate()).padStart(2, '0');
const fechaTareaFormateada = `${año}-${mes}-${dia}`;
          const esFechaPasada = fechaTareaFormateada < hoy1;
          console.log(`Fecha tarea: ${fechaTarea}, Es fecha de hoy: ${hoy1}`);
          
          return (
            <div
              key={fecha}
              style={{
                border: '2px solid #e0e0e0',
                padding: '20px',
                margin: '20px 0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: 'white',
                opacity: esFechaPasada ? 0.7 : 1, // ✅ Efecto visual para fechas pasadas
                position: 'relative'
              }}
            >
              
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid #007bff'
              }}>
                <h4 style={{ margin: 0, color: esFechaPasada ? '#6c757d' : '#007bff' }}>
                  🗓️ {new Date(fecha+`T12:00:00`).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <div style={{
                  backgroundColor: esFechaPasada ? '#6c757d' : '#007bff',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '15px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  ⏱️ {(grupo.totalDuracionEstimada / 60).toFixed(1)} horas
                </div>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {grupo.tareas.map((tarea) => (
                  <div
                    key={tarea.id}
                    style={{
                      border: '1px solid #ddd',
                      padding: '15px',
                      borderRadius: '6px',
                      backgroundColor: tarea.es_completada ? '#f8fff8' : (esFechaPasada ? '#f8f9fa' : '#fff'),
                      cursor: esFechaPasada ? 'not-allowed' : 'pointer', // ✅ Deshabilitar cursor si es fecha pasada
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      opacity: esFechaPasada && !tarea.es_completada ? 0.6 : 1
                    }}
                    // ✅ Solo permitir clic si no es fecha pasada y no está completada
                    onClick={() => {
                      if (!esFechaPasada && !tarea.es_completada) {
                        onTareaClick(tarea, tarea.sesionPadre);
                      }
                    }}
                  >
                    {/* ✅ Overlay para fechas pasadas */}
                    {esFechaPasada && !tarea.es_completada && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                      }}>
                        <div style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          padding: '5px 15px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          ⏰ Fecha pasada - No disponible
                        </div>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ 
                          margin: '0 0 8px 0', 
                          color: tarea.es_completada ? '#28a745' : (esFechaPasada ? '#6c757d' : '#333'),
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '18px',
                            color: tarea.es_completada ? '#28a745' : (esFechaPasada ? '#6c757d' : '#ffc107')
                          }}>
                            {tarea.es_completada ? '✅' : (esFechaPasada ? '⏰' : '📝')}
                          </span>
                          {tarea.nombre}
                          {esFechaPasada && !tarea.es_completada && (
                            <span style={{ 
                              fontSize: '12px', 
                              color: '#6c757d',
                              backgroundColor: '#f8f9fa',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              marginLeft: '8px'
                            }}>
                              Fecha pasada
                            </span>
                          )}
                        </h5>
                        
                        <div style={{ display: 'grid', gap: '4px', fontSize: '13px', color: '#666' }}>
                          <div>
                            <strong>📚 Sesión Padre:</strong> {tarea.sesionPadre.nombre}
                          </div>
                          <div>
                            <strong>🎯 Examen:</strong> {new Date(tarea.sesionPadre.fecha_examen).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right', minWidth: '120px' }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold',
                          color: tarea.es_completada ? '#28a745' : (esFechaPasada ? '#6c757d' : '#ffc107'),
                          marginBottom: '5px'
                        }}>
                          {tarea.duracion_estimada} min
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: tarea.es_completada ? '#28a745' : (esFechaPasada ? '#6c757d' : '#999'),
                          padding: '3px 8px',
                          backgroundColor: tarea.es_completada ? '#e8f5e8' : (esFechaPasada ? '#f8f9fa' : '#f8f9fa'),
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}>
                          {tarea.es_completada ? 
                            `✅ ${Conversion(tarea.tiempo_real_ejecucion) || 0}` : 
                            (esFechaPasada ? '⏰ Fecha pasada' : '⏳ Pendiente')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Botones de acción - Deshabilitados para fechas pasadas */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginTop: '12px',
                      justifyContent: 'flex-end'
                    }}>

                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTarea(tarea.id, tarea.nombre, e);
                        }}
                        style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                    
                    {/* Mensaje para fechas pasadas */}
                    {!tarea.es_completada && esFechaPasada && (
                      <div style={{ 
                        marginTop: '10px', 
                        padding: '8px', 
                        backgroundColor: '#fff3cd', 
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#856404',
                        border: '1px solid #ffeaa7',
                        textAlign: 'center'
                      }}>
                        ⚠️ Esta tarea corresponde a una fecha pasada y no puede ser gestionada
                      </div>
                    )}
                    
                    {tarea.es_completada && (
                      <div style={{ 
                        marginTop: '10px', 
                        padding: '5px', 
                        backgroundColor: '#e7f3ff', 
                        borderRadius: '3px',
                        fontSize: '11px',
                        color: '#0066cc',
                        textAlign: 'center'
                      }}>
                        💡 Tarea completada - Haz clic para ver detalles
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel lateral de resumen */}
      <div style={{ flex: 1 }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        }}>
          <h3 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
            📊 Resumen General
          </h3>
          
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#007bff', marginBottom: '15px', fontSize: '16px' }}>
              📈 Estadísticas Totales
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: '500' }}>📅 Días con tareas:</span>
                <strong style={{ fontSize: '16px' }}>{resumenGeneral.diasConTareas}</strong>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: '500' }}>📝 Total tareas:</span>
                <strong style={{ fontSize: '16px' }}>{resumenGeneral.totalTareas}</strong>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: '500', color: '#28a745' }}>✅ Completadas:</span>
                <strong style={{ fontSize: '16px', color: '#28a745' }}>{resumenGeneral.tareasCompletadas}</strong>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: '500', color: '#ffc107' }}>⏳ Pendientes:</span>
                <strong style={{ fontSize: '16px', color: '#ffc107' }}>{resumenGeneral.tareasPendientes}</strong>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: '#e7f3ff',
                borderRadius: '5px',
                borderTop: '2px solid #007bff',
                marginTop: '5px'
              }}>
                <span style={{ fontWeight: '600' }}>⏱️ Tiempo total:</span>
                <strong style={{ fontSize: '16px', color: '#007bff' }}>
                  {(resumenGeneral.totalDuracion / 60).toFixed(1)} horas
                </strong>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#007bff', marginBottom: '15px', fontSize: '16px' }}>
              🗓️ Tiempo por Día (Ordenado)
            </h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {Object.entries(tareasPorFecha).map(([fecha, grupo]) => {
                const fechaTarea = new Date(fecha);
                fechaTarea.setHours(0, 0, 0, 0);
                const esFechaPasada = fechaTarea < hoy;
                
                return (
                  <div key={fecha} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    padding: '6px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '13px',
                    opacity: esFechaPasada ? 0.6 : 1
                  }}>
                    <div>
                      <span style={{ fontWeight: '500' }}>
                        {new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                      {esFechaPasada && (
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#6c757d',
                          marginLeft: '5px'
                        }}>
                          ⏰
                        </span>
                      )}
                    </div>
                    <strong>{grupo.totalDuracionEstimada} min</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '6px',
            fontSize: '12px',
            borderLeft: '4px solid #007bff'
          }}>
            <strong style={{ color: '#007bff' }}>💡 Consejo:</strong> 
            <p style={{ margin: '5px 0 0 0' }}>
              Las fechas pasadas se muestran en gris y no pueden ser gestionadas. 
              Concéntrate en las tareas pendientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TareasPorFecha;
