import React, { useState, useEffect } from 'react';
import HeaderNoLink from './HeaderNoLink';

export default function GroupAdminDashboard() {
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [emailIntegrante, setEmailIntegrante] = useState('');
    const [listaEmails, setListaEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Función para agregar emails a la lista local antes de guardar
    const agregarEmail = (e) => {
        e.preventDefault();
        const emailLimpio = emailIntegrante.trim().toLowerCase();
        if (emailLimpio && !listaEmails.includes(emailLimpio)) {
            setListaEmails([...listaEmails, emailLimpio]);
            setEmailIntegrante('');
        }
    };

    const eliminarEmail = (email) => {
        setListaEmails(listaEmails.filter(m => m !== email));
    };

    const guardarGrupo = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/groups/manage`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre_grupo: nombreGrupo, // Campo según tu esquema
                    emails: listaEmails.join(',') // Guardamos como string separado por comas o según prefieras
                }),
            });
            if (response.ok) alert('Grupo y participantes actualizados con éxito');
        } catch (error) {
            alert('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Tarjeta-Principal">
            <HeaderNoLink />
            <div className="Form-Container">
                <h2 className="text-xl font-bold mb-4">Panel de Administración de Grupo</h2>
                
                <div className="Usuario">
                    <label className="block text-gray-700 mb-2">Nombre del Grupo:</label>
                    <div className="InputCorreo">
                        <input 
                            type="text" 
                            value={nombreGrupo} 
                            onChange={(e) => setNombreGrupo(e.target.value)} 
                            placeholder="Ej: Proyecto Investigación 2026"
                        />
                    </div>
                </div>

                <div className="Usuario mt-4">
                    <label className="block text-gray-700 mb-2">Añadir Participantes:</label>
                    <div className="flex gap-2">
                        <div className="InputCorreo flex-1">
                            <input 
                                type="email" 
                                value={emailIntegrante} 
                                onChange={(e) => setEmailIntegrante(e.target.value)} 
                                placeholder="usuario@correo.com"
                            />
                        </div>
                        <button onClick={agregarEmail} className="bg-blue-600 text-white px-4 rounded-xl font-bold">Añadir</button>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    {listaEmails.map(email => (
                        <div key={email} className="flex justify-between bg-gray-100 p-2 rounded-lg text-sm">
                            <span>{email}</span>
                            <button onClick={() => eliminarEmail(email)} className="text-red-500 font-bold">X</button>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={guardarGrupo} 
                    disabled={loading}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold mt-6"
                >
                    {loading ? 'Guardando...' : 'Sincronizar con Base de Datos'}
                </button>
            </div>
        </div>
    );
}