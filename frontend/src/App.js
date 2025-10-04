// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';

// Componente para a Página Inicial
function HomePage() {
  return (
    <div className="container">
      <header className="header">
        <div className="logo">Web Finanças</div>
        <nav>
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/register" className="btn-primary">Começar</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Controle suas <strong>finanças</strong> com facilidade</h1>
          <p>Gerencie seus gastos, acompanhe suas receitas e mantenha o controle total do seu dinheiro com nossa plataforma intuitiva.</p>
          <button className="btn-primary-solid">
            Acessar minha conta &rarr;
          </button>
        </section>

        <section className="features">
          <div className="feature-card">
            <div className="icon-placeholder">📄</div>
            <h3>Registro de Gastos</h3>
            <p>Registre facilmente suas entradas e saídas com categorização automática.</p>
          </div>
          <div className="feature-card">
            <div className="icon-placeholder">⚖️</div>
            <h3>Balanceamento</h3>
            <p>Visualize seu saldo e acompanhe o fluxo de caixa em tempo real.</p>
          </div>
          <div className="feature-card">
            <div className="icon-placeholder">📈</div>
            <h3>Relatórios</h3>
            <p>Análises detalhadas por período com gráficos interativos.</p>
          </div>
        </section>

        <section className="cta-section">
            <h2>Pronto para organizar suas finanças?</h2>
            <p>Comece agora mesmo e tenha controle total sobre seu dinheiro.</p>
        </section>
      </main>

      <footer className="footer">
        <p>Desenvolvido por LGSoftware</p>
      </footer>
    </div>
  );
}

// Componente principal que gerencia as rotas
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;