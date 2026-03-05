// FrontEnd/src/components/AdminDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        group_id: '',
        estado: false
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('authToken:', token);
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
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(updatedData)
            });
            // Actualizar estado local para feedback inmediato
            setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u));
        } catch (error) {
            alert("Error al actualizar");
        }
    };

    // Función para editar usuario (mostrar formulario)
    const startEditing = (user) => {
        setEditingUser(user);
        setEditForm({
            group_id: user.group_id || '',
            estado: user.estado
        });
    };

    // Función para guardar cambios de edición
    const saveEdit = async () => {
        if (!editingUser) return;
        
        try {
            await fetch(`/backend/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(editForm)
            });
            
            // Actualizar estado local
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
            setEditingUser(null);
            alert('Usuario actualizado correctamente');
        } catch (error) {
            alert("Error al actualizar usuario");
        }
    };

    // Función para cancelar edición
    const cancelEdit = () => {
        setEditingUser(null);
    };

    // Función para eliminar usuario
    const deleteUser = async (userId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
        
        try {
            await fetch(`/backend/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            setUsers(users.filter(u => u.id !== userId));
            alert('Usuario eliminado correctamente');
        } catch (error) {
            alert("Error al eliminar usuario");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Cargando datos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-6">
                    <span className="font-bold text-lg tracking-tight">ADMIN | Optimizador</span>
                    <button onClick={() => navigate('/')} className="text-sm hover:text-blue-400 transition">Ir al Inicio</button>
                </div>
                <button 
                    onClick={() => { 
                        localStorage.removeItem('authToken'); 
                        navigate('/login'); 
                    }} 
                    className="text-sm bg-red-600 hover:bg-red-700 py-2 px-4 rounded"
                >
                    Cerrar Sesión
                </button>
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
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Grupo</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Estado</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Acciones</th>
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
                                        {editingUser?.id === user.id ? (
                                            <select 
                                                value={editForm.group_id} 
                                                onChange={(e) => setEditForm({...editForm, group_id: e.target.value})}
                                                className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Sin Grupo</option>
                                                {groups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            user.grupo?.nombre || 'Sin grupo'
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingUser?.id === user.id ? (
                                            <input 
                                                type="checkbox" 
                                                checked={editForm.estado} 
                                                onChange={(e) => setEditForm({...editForm, estado: e.target.checked})}
                                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={user.estado} 
                                                    onChange={(e) => handleUpdate(user.id, 'estado', e.target.checked)}
                                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingUser?.id === user.id ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={saveEdit}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                >
                                                    Guardar
                                                </button>
                                                <button 
                                                    onClick={cancelEdit}
                                                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => startEditing(user)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => deleteUser(user.id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
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
