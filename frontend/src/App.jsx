// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './context/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectManagement from './pages/ProjectManagement';
import SprintManagement from './pages/SprintManagement';
import Board from './pages/Board';
import AISprintChat from './pages/AISprintChat';
import AICodeChat from './pages/AICodeChat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/project/create" element={<CreateProject />} />
                    <Route path="/projects" element={<ProjectManagement />} />
                    <Route path="/sprint-management/:projectId" element={<SprintManagement />} />
                    <Route path="/ai-sprint-chat/:projectId" element={<AISprintChat />} />
                    <Route path="/board" element={<Board />} />
                    <Route path="/ai/sprint" element={<AISprintChat />} />
                    <Route path="/ai/code" element={<AICodeChat />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
