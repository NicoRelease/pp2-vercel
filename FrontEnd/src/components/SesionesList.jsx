// components/TareasPorSesion.jsx
import React from 'react';
import Conversion from './Conversion';

// Añado onDeleteSesion a las props del componente
const TareasPorSesion = ({ sesiones, onTareaClick, onDeleteTarea, onGestionarTarea, onDeleteSession }) => {
  
  // 📌 Definir la fecha de hoy para la comparación de vencimiento
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
// Ejemplo de salida: "2025-11-24" (si hoy es 24 de noviembre de 2025)

  // ============================================================
  // 📌 AGRUPAR TAREAS POR SESIÓN (nuevo comportamiento solicitado)
  // ============================================================
  const agruparTareasPorSesion = () => {
    if (!sesiones || sesiones.length === 0) return {};

    const agrupado = {};

    sesiones.forEach(sesion => {
      const tareas = sesion.tareas || [];

      agrupado[sesion.id] = {
        sesionInfo: {
          id: sesion.id,
          nombre: sesion.nombre,
          fecha_examen: sesion.fecha_examen,
        },
        tareas: tareas.map(t => ({
          ...t,
          sesionPadre: {
            id: sesion.id,
            nombre: sesion.nombre,
            fecha_examen: sesion.fecha_examen
          }
        })),
        totalDuracionEstimada: tareas.reduce((acc, t) => acc + (t.duracion_estimada || 0), 0)
      };
    });

    return agrupado;
  };


  // ============================================================
  // 📌 Resumen General (ahora basado en sesiones)
  // ============================================================
  const calcularResumenGeneral = () => {
    const grupos = agruparTareasPorSesion();
    let totalTareas = 0;
    let totalDuracion = 0;
    let tareasCompletadas = 0;

    Object.values(grupos).forEach(grupo => {
      totalTareas += grupo.tareas.length;
      totalDuracion += grupo.totalDuracionEstimada;
      tareasCompletadas += grupo.tareas.filter(t => t.es_completada).length;
    });

    return {
      totalTareas,
      totalDuracion,
      tareasCompletadas,
      tareasPendientes: totalTareas - tareasCompletadas,
      totalSesiones: Object.keys(grupos).length
    };
  };

  const tareasPorSesion = agruparTareasPorSesion();
  const resumenGeneral = calcularResumenGeneral();

  if (Object.keys(tareasPorSesion).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>No hay tareas planificadas.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>

      {/* =======================================================
          PANEL PRINCIPAL: TAREAS AGRUPADAS POR SESIÓN
      ======================================================== */}
      <div style={{ flex: 3 }}>
        <h3 style={{ color: '#333', marginBottom: '25px' }}>
          📚 Tareas agrupadas por Sesión
        </h3>

        {Object.entries(tareasPorSesion).map(([sesionId, grupo]) => {
          const sesion = grupo.sesionInfo;

          return (
            <div
              key={sesionId}
              style={{
                border: '2px solid #e0e0e0',
                padding: '20px',
                margin: '20px 0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: 'white'
              }}
            >
              {/* Encabezado de la sesión */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid #007bff'
              }}>
                <h4 style={{ margin: 0, color: '#007bff' }}>
                  📘 {sesion.nombre}
                </h4>
                
                {/* Contenedor del tiempo total y el botón de eliminar */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Botón de Eliminar Sesión */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(sesion.id, sesion.nombre); 
                        }}
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                        title={`Eliminar la sesión: ${sesion.nombre}`}
                    >
                        🗑️ Borrar Sesión
                    </button>
                    
                    <div style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '5px 15px',
                      borderRadius: '15px',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {(grupo.totalDuracionEstimada / 60) > 1 ? 
                        `⏱️ Tiempo total de sesión: ${(grupo.totalDuracionEstimada / 60).toFixed(0)} horas` : `⏱️ Tiempo total de sesión: ${(grupo.totalDuracionEstimada / 60).toFixed(0)} hora`}
                    </div>
                </div>
              </div>

              {/* Tareas de la sesión */}
              <div style={{ display: 'grid', gap: '12px' }}>
                {grupo.tareas.map((tarea) => {
                  // 🛑 Lógica para verificar si la tarea está vencida 🛑
                  //const fechaTarea = new Date(tarea.fecha_programada);
                  //fechaTarea.setHours(0, 0, 0, 0);
const fechaString= tarea.fecha_programada;
const fechaTarea = new Date(`${fechaString}T12:00:00`);
console.log (`FechaProgramada: ${tarea.fecha_programada}`);
console.log(`FechaTarea: ${fechaTarea}`);

// Obtener el año
const año = fechaTarea.getFullYear();

// Obtener el mes (getMonth() devuelve 0-11, así que sumamos 1)
// Usamos padStart(2, '0') para asegurar dos dígitos
const mes = String(fechaTarea.getMonth() + 1).padStart(2, '0');
// Obtener el día del mes
// Usamos padStart(2, '0') para asegurar dos dígitos
const dia = String(fechaTarea.getDate()).padStart(2, '0');

// Concatenar para obtener el formato yyyy-mm-dd
const fechaTareaFormateada = `${año}-${mes}-${dia}`;

console.log(`Formato fecha formateada: ${fechaTareaFormateada}`);
// Ejemplo de salida: "2025-11-24" (si hoy es 24 de noviembre de 2025)
                  const esFechaPasada = fechaTareaFormateada < hoy1;
                  
                  return (
                    <div
                      key={tarea.id}
                      style={{
                        border: '1px solid #ddd',
                        padding: '15px',
                        borderRadius: '6px',
                        backgroundColor: tarea.es_completada ? '#f8fff8' : (esFechaPasada ? '#f8f9fa' : '#fff'),
                        transition: 'all 0.3s ease',
                        cursor: esFechaPasada && !tarea.es_completada ? 'not-allowed' : 'pointer', // 🛑 Deshabilitar cursor
                        position: 'relative',
                        opacity: esFechaPasada && !tarea.es_completada ? 0.6 : 1 // 🛑 Reducir opacidad si está vencida y pendiente
                      }}
                      // 🛑 Bloquear la acción onClick si está vencida y pendiente 🛑
                      onClick={() => {
                        if (!esFechaPasada && !tarea.es_completada) {
                          onTareaClick(tarea, tarea.sesionPadre);
                        } else if (tarea.es_completada) {
                          // Opcional: permitir clic para ver detalles si está completada
                          onTareaClick(tarea, tarea.sesionPadre); 
                        }
                      }}
                    >
                      {/* 🛑 Overlay para fechas pasadas y no completadas 🛑 */}
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
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      
                      <div style={{ flex: 1 }}>
                        <h5 style={{
                          margin: '0 0 8px',
                          color: tarea.es_completada ? '#28a745' : (esFechaPasada ? '#6c757d' : '#333'), // 🛑 Color si está vencida
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
                        </h5>

                        <div style={{ display: 'grid', gap: '4px', fontSize: '13px', color: '#666' }}>
                          <div>
                            <strong>🗓️ Fecha programada:</strong> 
                            {new Date(fechaTarea).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                          </div>
                          <div><strong>🎯 Examen:</strong> {new Date(sesion.fecha_examen).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '120px' }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: tarea.es_completada ? '#28a745' : (esFechaPasada ? '#6c757d' : '#ffc107'), // 🛑 Color si está vencida
                          marginBottom: '5px'
                        }}>
                          {tarea.duracion_estimada} min
                        </div>

                        <div style={{
                          fontSize: '12px',
                          padding: '3px 8px',
                          backgroundColor: tarea.es_completada ? '#e8f5e8' : (esFechaPasada ? '#f8f9fa' : '#f8f9fa'), // 🛑 Color de fondo si está vencida
                          borderRadius: '12px',
                          display: 'inline-block',
                          color: tarea.es_completada ? '#28a745' : (esFechaPasada ? '#6c757d' : '#999') // 🛑 Color de texto si está vencida
                        }}>
                          {tarea.es_completada ?
                            `Tiempo real: ${Conversion(tarea.tiempo_real_ejecucion)}` :
                            (esFechaPasada ? '⏰ Vencida' : '⏳ Pendiente')} 
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción - Deshabilitados para tareas vencidas y no completadas */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      
                      {/* Botón Eliminar Tarea (se mantiene activo, ya que puedes eliminar una tarea vencida) */}
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

                    {/* 🛑 Mensaje para tareas vencidas y no completadas 🛑 */}
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
                        ⚠️ Tarea vencida - No puede ser gestionada como pendiente.
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
                );
              })}
              </div>
            </div>
          );
        })}
      </div>

      {/* =======================================================
          PANEL LATERAL DE RESUMEN
      ======================================================== */}
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '8px', borderRadius: '5px' }}>
                <span>📚 Total sesiones:</span>
                <strong>{resumenGeneral.totalSesiones}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '8px', borderRadius: '5px' }}>
                <span>📝 Total tareas:</span>
                <strong>{resumenGeneral.totalTareas}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '8px', borderRadius: '5px' }}>
                <span style={{ color: '#28a745' }}>✅ Completadas:</span>
                <strong style={{ color: '#28a745' }}>{resumenGeneral.tareasCompletadas}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '8px', borderRadius: '5px' }}>
                <span style={{ color: '#ffc107' }}>⏳ Pendientes:</span>
                <strong style={{ color: '#ffc107' }}>{resumenGeneral.tareasPendientes}</strong>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: '#e7f3ff',
                padding: '8px',
                borderRadius: '5px',
                borderTop: '2px solid #007bff'
              }}>
                <span>⏱️ Tiempo total:</span>
                <strong style={{ color: '#007bff' }}>
                  {(resumenGeneral.totalDuracion / 60).toFixed(1)} horas
                </strong>
              </div>

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
              Las tareas **vencidas** (fecha programada anterior a hoy) y **pendientes** se marcan como no gestionables.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TareasPorSesion;