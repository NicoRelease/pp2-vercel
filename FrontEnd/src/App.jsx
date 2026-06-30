import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import SessionForm from './components/SessionForm';
import GestorEstudio from './components/GestorEstudio';
import TareaManager from './components/TareaManager';
import SessionDetail from './components/SessionDetail';
import Login from './components/Login';
import Register from './components/Register';
import GroupResume from './components/GrupoResumen';

// Importa los nuevos componentes
import AdminDashboard from './components/AdminDashboard';
import GroupAdminDashboard from './components/GroupAdminDashboard'; 
import WaitingRoom from './components/WaitingRoom'; 
import DirectAccessError from './components/DirectAccessError';

// Importar protección de rutas
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import '../src/App.css';

function App() {
  return (
    <Router>
      <div className="app-container" >
        <main>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/error-directo" element={<DirectAccessError />} />
            
            {/* Rutas Protegidas de Administración y Onboarding */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={[1]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/group-admin" element={
              <ProtectedRoute allowedRoles={[1, 2]}>
                <GroupAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/waiting-room" element={
              <ProtectedRoute>
                <WaitingRoom />
              </ProtectedRoute>
            } />

            {/* Rutas Protegidas de la Aplicación */}
            <Route path="/crear-sesion" element={
              <ProtectedRoute allowedRoles={[2, 3]}>
                <SessionForm />
              </ProtectedRoute>
            } />
            <Route path="/grupo-resumen" element={
              <ProtectedRoute allowedRoles={[3]}>
                <GroupResume />
              </ProtectedRoute>
            } />
            <Route path="/gestor-estudio" element={
              <ProtectedRoute allowedRoles={[2, 3]}>
                <GestorEstudio />
              </ProtectedRoute>
            } />
            <Route path="/tareas/:tareaId" element={
              <ProtectedRoute allowedRoles={[3]}>
                <TareaManager />
              </ProtectedRoute>
            } />
            <Route path="/session/:id" element={
              <ProtectedRoute allowedRoles={[2, 3]}>
                <SessionDetail />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
