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
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken');

    // Cargar todos los grupos del Admin al iniciar
    const cargarGrupos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/groups/all`, { // Ajusta a tu nueva ruta de "listar"
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setGrupos(Array.isArray(data) ? data : [data]);
        } catch (error) {
            console.error("Error cargando grupos:", error);
        }
    };

    useEffect(() => { cargarGrupos(); }, []);

    // Al seleccionar un grupo de la lista
    const seleccionarGrupo = (grupo) => {
        setIdSeleccionada(grupo.id);
        setNombreGrupo(grupo.nombre_grupo);
        setListaEmails(grupo.email ? grupo.email.split(',').filter(e => e !== "") : []);
    };

    // Limpiar para crear uno nuevo
    const prepararNuevoGrupo = () => {
        setIdSeleccionada(null);
        setNombreGrupo('');
        setListaEmails([]);
    };

    const agregarEmail = (e) => {
        e.preventDefault();
        const email = emailIntegrante.trim().toLowerCase();
        if (email && !listaEmails.includes(email)) {
            setListaEmails([...listaEmails, email]);
            setEmailIntegrante('');
        }
    };

    const guardarCambios = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/groups/manage`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    id: idSeleccionada, // Si es null, el back debería crear uno nuevo
                    nombre_grupo: nombreGrupo,
                    emails: listaEmails.join(',')
                }),
            });
            if (response.ok) {
                alert('¡Guardado con éxito!');
                cargarGrupos(); // Recargar la lista
                if (!idSeleccionada) prepararNuevoGrupo();
            }
        } catch (error) {
            alert('Error al sincronizar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Tarjeta-Principal" style={{ maxWidth: '900px' }}>
            <HeaderNoLink />
            <div className="flex flex-col md:flex-row gap-6 p-4">
                
                {/* COLUMNA IZQUIERDA: Listado (Sidebar) */}
                <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">Mis Grupos</h3>
                        <button onClick={prepararNuevoGrupo} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg">+ Nuevo</button>
                    </div>
                    <div className="space-y-2">
                        {grupos.map(g => (
                            <div 
                                key={g.id} 
                                onClick={() => seleccionarGrupo(g)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${idSeleccionada === g.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white hover:bg-blue-50 border border-gray-100'}`}
                            >
                                <p className="font-semibold text-sm truncate">{g.nombre_grupo || 'Sin nombre'}</p>
                                <p className={`text-xs ${idSeleccionada === g.id ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {g.email ? g.email.split(',').length : 0} integrantes
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMNA DERECHA: Editor / Creador */}
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">
                        {idSeleccionada ? `Editando: ${nombreGrupo}` : 'Crear Nuevo Grupo'}
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
                            <input 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                type="text" 
                                value={nombreGrupo} 
                                onChange={(e) => setNombreGrupo(e.target.value)} 
                                placeholder="Nombre del proyecto..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Agregar Integrante</label>
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 p-2 border border-gray-300 rounded-lg outline-none"
                                    type="email" 
                                    value={emailIntegrante} 
                                    onChange={(e) => setEmailIntegrante(e.target.value)} 
                                    placeholder="correo@ejemplo.com"
                                />
                                <button onClick={agregarEmail} className="bg-gray-800 text-white px-4 rounded-lg font-bold hover:bg-black">Add</button>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Lista de Integrantes</p>
                            <div className="flex flex-wrap gap-2">
                                {listaEmails.map(email => (
                                    <span key={email} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                                        {email}
                                        <button onClick={() => setListaEmails(listaEmails.filter(e => e !== email))} className="text-red-500 hover:text-red-700">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={guardarCambios} 
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${idSeleccionada ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {loading ? 'Procesando...' : idSeleccionada ? 'Actualizar Cambios' : 'Registrar Grupo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}