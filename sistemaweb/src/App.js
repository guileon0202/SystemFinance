import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register'; // Importa o novo componente

import './App.css'; // Mantenha ou remova o CSS padrão

function App() {
  return (
    <Router>
      <nav>
        <Link to="/register">Cadastre-se</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        {/* Futuras rotas para Login, Dashboard, etc. */}
      </Routes>
    </Router>
  );
}

export default App;