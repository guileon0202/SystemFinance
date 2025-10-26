import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = ({ user, handleLogout }) => {
  return (
    <header className="main-header">
      <Link to="/dashboard" className="logo-link">
        <div className="logo"><strong>Web</strong> Finance</div>
      </Link>

      <nav className="main-nav">
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <NavLink to="/transactions" className="nav-link">Transações</NavLink>
        <NavLink to="/balanceamento" className="nav-link">Balanceamento</NavLink>
        <NavLink to="/feedback" className="nav-link">Feedback</NavLink>
        <NavLink to="/investimentos" className="nav-link">Investimentos</NavLink>
      </nav>
      
      <div className="user-menu">
        <Link to="/perfil" className="user-name-link">
            <span>Olá, {user.nome}!</span>
        </Link>
        <button onClick={handleLogout} className="logout-btn">Sair</button>
      </div>
    </header>
  );
};

export default Header;