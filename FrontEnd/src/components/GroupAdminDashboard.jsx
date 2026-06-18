import React, { useState, useEffect } from 'react';
import HeaderNoLink from './HeaderNoLink';

export default function GroupAdminDashboard() {
    // Estados para la lista y selección
    const [grupos, setGrupos] = useState([]);
    const [idSeleccionada, setIdSeleccionada] = useState(null);
    
    // Estados del formulario (compartidos para crear/editar)
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [emailIntegrante, setEmailIntegrante] = useState('');
    const [listaEmails, setListaEmails] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken');
    const adminId = localStorage.getItem('userId');
    const cleanAdminId = adminId ? adminId.trim().replace(/"/g, '') : null;
    const adminIdNum = Number(cleanAdminId);
    console.log("ID limpio:", adminId,cleanAdminId,adminIdNum); 
    

    // Cargar todos los grupos del Admin al iniciar
    const cargarGrupos = async () => {
        try {
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }
            
            const response = await fetch(`${API_BASE_URL}/groups/all`, { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log ("datos de response en URL", response)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            
            const data = await response.json();
            setGrupos(Array.isArray(data) ? data : [data]);
            setError(null);
        } catch (error) {
            console.error("Error cargando grupos:", error);
            setError('Error al cargar la lista de grupos. Por favor, intente nuevamente.');
        }
    };

    useEffect(() => { 
        if (token) {
            cargarGrupos(); 
        } else {
            setError('No se encontró token de autenticación. Por favor, inicie sesión.');
        }
    }, [token]);

    // Función para preparar nuevo grupo
    const prepararNuevoGrupo = () => {
        setIdSeleccionada(null);
        setNombreGrupo('');
        setListaEmails([]);
        setError(null);
    };

    // Al seleccionar un grupo de la lista
    const seleccionarGrupo = (grupo) => {
        try {
            setIdSeleccionada(grupo.id);
            setNombreGrupo(grupo.nombre_grupo);
            
            // Cargar los emails asociados al grupo
            if (grupo.emails && Array.isArray(grupo.emails)) {
                setListaEmails(grupo.emails);
            } else if (grupo.email) {
                // Para compatibilidad con datos antiguos
                setListaEmails(grupo.email.split(',').filter(e => e !== ""));
            } else {
                setListaEmails([]);
            }
            setError(null);
        } catch (error) {
            console.error("Error seleccionando grupo:", error);
            setError('Error al cargar los detalles del grupo');
        }
    };

    // En el formulario de emails, se mantiene igual:
    const agregarEmail = (e) => {
        e.preventDefault();
        try {
            const email = emailIntegrante.trim().toLowerCase();
            
            if (!email) {
                setError('Por favor, ingrese un correo electrónico');
                return;
            }
            
            if (!/\S+@\S+\.\S+/.test(email)) {
                setError('Por favor, ingrese un correo electrónico válido');
                return;
            }
            
            if (listaEmails.includes(email)) {
                setError('Este correo ya ha sido agregado');
                return;
            }
            
            setListaEmails([...listaEmails, email]);
            setEmailIntegrante('');
            setError(null);
        } catch (error) {
            console.error("Error agregando email:", error);
            setError('Error al agregar el correo electrónico');
        }
    };

    // Al guardar cambios:
    const guardarCambios = async () => {
        setLoading(true);
        setError(null);
        console.log("IdSeleccionada y adminId:", idSeleccionada, adminId);
        try {
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }
            
            if (!nombreGrupo.trim()) {
                throw new Error('Por favor, ingrese un nombre para el grupo');
            }
            
            const response = await fetch(`${API_BASE_URL}/groups/manage`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    id: idSeleccionada,
                    admin_id: adminIdNum,
                    nombre_grupo: nombreGrupo.trim(),
                    emails: listaEmails
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            
            const result = await response.json();
            alert('¡Guardado con éxito!');
            cargarGrupos();
            if (!idSeleccionada) prepararNuevoGrupo();
        } catch (error) {
            console.error("Error guardando cambios:", error);
            setError(error.message || 'Error al guardar los cambios. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar grupo
    const eliminarGrupo = async (id) => {
        if (!token) {
            setError('No se encontró token de autenticación');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/groups/delete/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            
            // Eliminar el grupo de la lista local
            setGrupos(grupos.filter(grupo => grupo.id !== id));
            
            // Si el grupo eliminado era el seleccionado, limpiar selección
            if (idSeleccionada === id) {
                prepararNuevoGrupo();
            }
            
            alert('¡Grupo eliminado con éxito!');
            setError(null);
        } catch (error) {
            console.error("Error eliminando grupo:", error);
            setError(error.message || 'Error al eliminar el grupo. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
            setConfirmDeleteId(null);
        }
    };

    // Mostrar confirmación de eliminación
    const mostrarConfirmacionEliminar = (id) => {
        setConfirmDeleteId(id);
    };

    // Cancelar confirmación de eliminación
    const cancelarEliminacion = () => {
        setConfirmDeleteId(null);
    };

    return (
        <div className="Tarjeta-Principal">
            <HeaderNoLink />
            <div className="group-dashboard-container">
                
                {/* COLUMNA IZQUIERDA: Listado (Sidebar) */}
                <div className="group-sidebar">
                    <div className="group-sidebar-header">
                        <h3 className="group-sidebar-title">Mis Grupos</h3>
                        <button onClick={prepararNuevoGrupo} className="new-group-btn">+ Nuevo</button>
                    </div>
                    <div className="group-list">
                        {grupos.map(g => (
                            <div 
                                key={g.id} 
                                onClick={() => seleccionarGrupo(g)}
                                className={`group-item ${idSeleccionada === g.id ? 'selected' : ''}`}
                            >
                                <div className="group-item-content">
                                    <p className="group-item-title">{g.nombre_grupo || 'Sin nombre'}</p>
                                    <p className="group-item-meta">{g.emails ? g.emails.length : 0} integrantes</p>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        mostrarConfirmacionEliminar(g.id);
                                    }}
                                    className="group-delete-btn"
                                    title="Eliminar grupo"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMNA DERECHA: Editor / Creador */}
                <div className="group-editor">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    {confirmDeleteId && (
                        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm delete-confirmation">
                            <p>¿Está seguro que desea eliminar este grupo?</p>
                            <div className="flex gap-2 mt-2 delete-confirmation-buttons">
                                <button 
                                    onClick={() => eliminarGrupo(confirmDeleteId)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm delete-confirm-btn"
                                >
                                    Sí, Eliminar
                                </button>
                                <button 
                                    onClick={cancelarEliminacion}
                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm delete-cancel-btn"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <h2 className="group-editor-title">
                        {idSeleccionada ? `Editando: ${nombreGrupo}` : 'Crear Nuevo Grupo'}
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="form-section">
                            <label className="form-label">Nombre del Grupo</label>
                            <input 
                                className="input-field"
                                type="text" 
                                value={nombreGrupo} 
                                onChange={(e) => setNombreGrupo(e.target.value)} 
                                placeholder="Nombre del proyecto..."
                            />
                        </div>

                        <div className="form-section">
                            <label className="form-label">Agregar Integrante</label>
                            <div className="email-input-container">
                                <input 
                                    className="email-input"
                                    type="email" 
                                    value={emailIntegrante} 
                                    onChange={(e) => setEmailIntegrante(e.target.value)} 
                                    placeholder="correo@ejemplo.com"
                                />
                                <button onClick={agregarEmail} className="add-email-btn">Add</button>
                            </div>
                        </div>

                        <div className="form-section">
                            <label className="form-label">Lista de Integrantes</label>
                            <div className="email-tags-container">
                                <p className="email-tags-title">Integrantes del grupo</p>
                                <div className="flex flex-wrap gap-2">
                                    {listaEmails.map(email => (
                                        <span key={email} className="email-tag">
                                            {email}
                                            <button onClick={() => setListaEmails(listaEmails.filter(e => e !== email))} className="email-tag-remove">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={guardarCambios} 
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-bold text-black transition-all save-btn ${idSeleccionada ? 'updating' : 'creating'}`}
                        >
                            {loading ? 'Procesando...' : idSeleccionada ? 'Actualizar Cambios' : 'Registrar Grupo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
