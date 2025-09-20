import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { HeaderContainer, HeaderContent, UserInfo } from './styles';

function Header() {
  const { user, signOut } = useAuth();

  return (
    <HeaderContainer>
      <HeaderContent>
        <h2>Web Finance</h2>
        {user && (
          <UserInfo>
            <span>Olá, {user.name}</span>
            <button type="button" onClick={signOut}>
              Sair
            </button>
          </UserInfo>
        )}
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;