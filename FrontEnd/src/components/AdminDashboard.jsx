import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNoLink from './HeaderNoLink'; 

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
            <div className="admin-dashboard-loading">
                Cargando datos...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <HeaderNoLink />
            
            <main className="admin-dashboard-content">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Usuarios</h2>
                
                <div className="admin-dashboard-table-container">
                    <table className="admin-dashboard-table">
                        <thead className="admin-dashboard-table-header">
                            <tr>
                                <th className="admin-dashboard-table-header-cell">Username</th>
                                <th className="admin-dashboard-table-header-cell">Email</th>
                                <th className="admin-dashboard-table-header-cell">Creado el</th>
                                <th className="admin-dashboard-table-header-cell">Rol</th>
                                <th className="admin-dashboard-table-header-cell">Grupo</th>
                                <th className="admin-dashboard-table-header-cell">Estado</th>
                                <th className="admin-dashboard-table-header-cell">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="admin-dashboard-table-row">
                                    <td className="admin-dashboard-table-cell">{user.username}</td>
                                    <td className="admin-dashboard-table-cell">{user.email}</td>
                                    <td className="admin-dashboard-table-cell">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="admin-dashboard-table-cell">
                                        <span className="admin-dashboard-user-role">
                                            {user.rol?.nombre}
                                        </span>
                                    </td>
                                    <td className="admin-dashboard-table-cell">
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
                                            <span className="admin-dashboard-user-group">
                                                {user.grupo?.nombre || 'Sin grupo'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="admin-dashboard-table-cell">
                                        {editingUser?.id === user.id ? (
                                            <input 
                                                type="checkbox" 
                                                checked={editForm.estado} 
                                                onChange={(e) => setEditForm({...editForm, estado: e.target.checked})}
                                                className="admin-dashboard-checkbox"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={user.estado} 
                                                    onChange={(e) => handleUpdate(user.id, 'estado', e.target.checked)}
                                                    className="admin-dashboard-checkbox"
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className="admin-dashboard-table-cell">
                                        {editingUser?.id === user.id ? (
                                            <div className="admin-dashboard-actions">
                                                <button 
                                                    onClick={saveEdit}
                                                    className="admin-dashboard-action-btn admin-dashboard-save-btn"
                                                >
                                                    Guardar
                                                </button>
                                                <button 
                                                    onClick={cancelEdit}
                                                    className="admin-dashboard-action-btn admin-dashboard-cancel-btn"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="admin-dashboard-actions">
                                                <button 
                                                    onClick={() => startEditing(user)}
                                                    className="admin-dashboard-action-btn admin-dashboard-edit-btn"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => deleteUser(user.id)}
                                                    className="admin-dashboard-action-btn admin-dashboard-delete-btn"
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
