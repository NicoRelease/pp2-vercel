import React from 'react';

const ResumenLateral = ({ stats, tipo }) => {
  return (
    <div style={styles.resumenContainer}>
      <h3 style={styles.headerTitle}>📊 Resumen General</h3>
      <div style={styles.divider} />
      <h4 style={styles.subTitle}>📈 Estadísticas Totales</h4>

      <div style={styles.statsGrid}>
        {/* Renderizado condicional según si es vista por Fecha o Sesión */}
        {tipo === 'fecha' ? (
          <StatBox emoji="📅" label="Días con tareas" value={stats.totalFechas || 0} />
        ) : (
          <StatBox emoji="📚" label="Total sesiones" value={stats.totalSesiones || 0} />
        )}

        <StatBox emoji="📝" label="Total tareas" value={stats.totalTareas || 0} />
        <StatBox emoji="✅" label="Completadas" value={stats.tareasCompletadas || 0} color="#28a745" />
        <StatBox emoji="⏳" label="Pendientes" value={stats.tareasPendientes || 0} color="#ffc107" />

        <div style={styles.tiempoBox}>
          <span style={{ fontSize: '18px' }}>⏱️</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#333' }}>Tiempo total:</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '16px' }}>
                {(stats.totalDuracion / 60).toFixed(1)}
              </div>
              <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '14px' }}>horas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ emoji, label, value, color = '#333' }) => (
  <div style={styles.statBox}>
    <span style={{ fontSize: '18px' }}>{emoji}</span>
    <span style={{ fontSize: '14px', flex: 1, marginLeft: '8px', color: '#333' }}>{label}:</span>
    <strong style={{ fontSize: '16px', color }}>{value}</strong>
  </div>
);

const styles = {
  resumenContainer: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    minWidth: '280px',
    height: 'fit-content',
    border: '1px solid #eee'
  },
  headerTitle: { fontSize: '18px', margin: '0 0 10px 0', color: '#444', display: 'flex', alignItems: 'center', gap: '8px' },
  subTitle: { fontSize: '15px', color: '#007bff', margin: '10px 0', fontWeight: '500' },
  divider: { height: '2px', backgroundColor: '#007bff', marginBottom: '15px' },
  statsGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
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
    marginTop: '5px'
  }
};

export default ResumenLateral;