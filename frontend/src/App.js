import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import BalanceamentoPage from './pages/BalanceamentoPage';
import FeedbackPage from './pages/FeedbackPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import InvestmentsPage from './pages/InvestmentsPage';

// --- Componente da Página Inicial ---
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
          <Link to="/login" className="btn-primary-solid">
            Acessar minha conta &rarr;
          </Link>
        </section>
        <section className="features">
          <div className="feature-card"><div className="icon-placeholder">📄</div><h3>Registro de Gastos</h3><p>Registre facilmente suas entradas e saídas com categorização automática.</p></div>
          <div className="feature-card"><div className="icon-placeholder">⚖️</div><h3>Balanceamento</h3><p>Visualize seu saldo e acompanhe o fluxo de caixa em tempo real.</p></div>
          <div className="feature-card"><div className="icon-placeholder">📈</div><h3>Relatórios</h3><p>Análises detalhadas por período com gráficos interativos.</p></div>
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
// --- Fim do Componente da Página Inicial ---


// --- Componente principal que gerencia as rotas ---
function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/balanceamento" element={<BalanceamentoPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/termos-de-uso" element={<TermsPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/redefinir-senha/:token" element={<ResetPasswordPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/investimentos" element={<InvestmentsPage />} />
      </Routes>
    </Router>
  );
}

export default App;