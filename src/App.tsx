import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 


import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import ParticipantsPage from './pages/ParticipantsPage';
import VotingPage from './pages/VotingPage';
import LoginPage from './pages/LoginPage'; 
import ResultsDashboard from './pages/ResultsDashboard'; 

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/participantes" element={<ParticipantsPage />} />
          <Route path="/votacion" element={<VotingPage />} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/resultados" element={<ResultsDashboard />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;