import React from 'react';
import Header from '../../components/layout/Header';
import { Container, Content } from './styles';

function Dashboard() {
  return (
    <Container>
      <Header />
      <Content>
        <h1>Minhas Finanças</h1>
        {/* Aqui você começará a construir o corpo do seu dashboard */}
        <p>Bem-vindo ao seu painel financeiro!</p>
      </Content>
    </Container>
  );
}

export default Dashboard;