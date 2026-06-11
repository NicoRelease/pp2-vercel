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

import './App.css';
import '../src/App.css';

function App() {
  return (
    <Router>
      <div className="app-container" >
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            
            {/* Rutas de Administración y Onboarding */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/group-admin" element={<GroupAdminDashboard />} />
            <Route path="/waiting-room" element={<WaitingRoom />} />

            {/* Rutas de la Aplicación */}
            <Route path="/crear-sesion" element={<SessionForm />} />
            <Route path="/grupo-resumen" element={<GroupResume />} />
            <Route path="/gestor-estudio" element={<GestorEstudio />} />
            <Route path="/tareas/:tareaId" element={<TareaManager />} />
            <Route path="/session/:id" element={<SessionDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;