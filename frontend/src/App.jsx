import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Sessions from './components/Sessions';
import SessionDetails from './components/SessionDetails';
import Chat from './components/Chat';
import History from './components/History';
import Forum from './components/Forum';
import QuestionDetail from './components/QuestionDetail';

function App() {
  const [isAuth, setIsAuth] = React.useState(!!localStorage.getItem('token'));

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={isAuth ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/sessions" element={isAuth ? <Sessions /> : <Navigate to="/login" />} />
        <Route path="/session/:id" element={isAuth ? <SessionDetails /> : <Navigate to="/login" />} />
        <Route path="/chat/:sessionId" element={isAuth ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/history" element={isAuth ? <History /> : <Navigate to="/login" />} />
        <Route path="/forum" element={isAuth ? <Forum /> : <Navigate to="/login" />} />
        <Route path="/forum/:id" element={isAuth ? <QuestionDetail /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuth ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
