// arquivo: frontend/src/components/Header.js

import React from 'react';
import { Link, NavLink } from 'react-router-dom';

// O Header agora recebe o 'user' e a função 'handleLogout' como propriedades (props)
const Header = ({ user, handleLogout, activeLink }) => {
  return (
    <header className="main-header">
      {/* O logo agora é um link para o Dashboard */}
      <Link to="/dashboard" className="logo-link">
        <div className="logo"><strong>Web</strong> Finanças</div>
      </Link>

      <nav className="main-nav">
        {/* Usamos NavLink para destacar o link ativo automaticamente */}
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <NavLink to="/transactions" className="nav-link">Transações</NavLink>
        <NavLink to="/balanceamento" className="nav-link">Balanceamento</NavLink>
        <NavLink to="/feedback" className="nav-link">Feedback</NavLink>
      </nav>

      <div className="user-menu">
        {/* Opcional: Adiciona um link para o perfil do usuário */}
        <Link to="/perfil" className="user-name-link">
            <span>Olá, {user.nome}!</span>
        </Link>
        <button onClick={handleLogout} className="logout-btn">Sair</button>
      </div>
    </header>
  );
};

export default Header;