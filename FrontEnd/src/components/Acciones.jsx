


export const manejarAccion = async (accion) => {
    if (!tarea) return;

    try {
      const tiempoEjecutado = 
        (accion === 'stop' || accion === 'pause') 
          ? tiempoTranscurrido 
          : 0;
      
      const response = await axios.post(`${API_BASE_URL}/tareas/${tarea.id}/gestionar`, {
        action: accion,
        tiempo_ejecutado: tiempoEjecutado
      });

      if (accion === 'start') {
        setEstaActiva(true);
      } else if (accion === 'pause') {
        setEstaActiva(false);
        setTarea(response.data.tarea);
      } else if (accion === 'stop') {
        setEstaActiva(false);
        setTarea(response.data.tarea);
        setTiempoTranscurrido(0);
      }

      //alert(`Tarea ${accion} exitosamente`);

    } catch (err) {
      alert('Error al gestionar tarea: ' + (err.response?.data?.message || err.message));
    }
  };