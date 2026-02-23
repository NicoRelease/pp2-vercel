import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [usersRes, groupsRes] = await Promise.all([
                fetch('/backend/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/backend/admin/groups', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            setUsers(await usersRes.json());
            setGroups(await groupsRes.json());
            setLoading(false);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    // Función para actualizar usuario en la DB
    const handleUpdate = async (userId, field, value) => {
        const user = users.find(u => u.id === userId);
        const updatedData = {
            group_id: field === 'group_id' ? value : user.group_id,
            estado: field === 'estado' ? value : user.estado
        };

        try {
            await fetch(`/backend/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedData)
            });
            // Actualizar estado local para feedback inmediato
            setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u));
        } catch (error) {
            alert("Error al actualizar");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-6">
                    <span className="font-bold text-lg tracking-tight">ADMIN | Optimizador</span>
                    <button onClick={() => navigate('/')} className="text-sm hover:text-blue-400 transition">Ir al Inicio</button>
                </div>
                <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} 
                        className="text-sm bg-red-600 hover:bg-red-700 py-2 px-4 rounded">Cerrar Sesión</button>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Usuarios</h2>
                
                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Username</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Email</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Creado el</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Rol</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Grupo (Editable)</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-blue-50/50 transition">
                                    <td className="p-4 font-medium text-gray-700">{user.username}</td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs uppercase font-bold">
                                            {user.rol?.nombre}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <select 
                                            value={user.group_id || ""} 
                                            onChange={(e) => handleUpdate(user.id, 'group_id', e.target.value)}
                                            className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Sin Grupo</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.nombre}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={user.estado} 
                                                onChange={(e) => handleUpdate(user.id, 'estado', e.target.checked)}
                                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;