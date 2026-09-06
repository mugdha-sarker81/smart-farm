import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fields from './pages/Fields';
import Crops from './pages/Crops';
import DetectDisease from './pages/DetectDisease';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Workers from './pages/Workers';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import AIAssistant from './pages/AIAssistant';

// Context
import { FarmProvider } from './context/FarmContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <FarmProvider>
        <Router>
          <Routes>
            {/* Public route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="fields" element={<Fields />} />
              <Route path="crops" element={<Crops />} />
              <Route path="detect-disease" element={<DetectDisease />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="workers" element={<Workers />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
            </Route>
          </Routes>
          <ToastContainer position="bottom-right" theme="colored" />
        </Router>
      </FarmProvider>
    </AuthProvider>
  );
}

export default App;