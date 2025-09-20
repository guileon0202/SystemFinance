// Dentro de Frontend/src/pages/Register/index.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// CORREÇÃO: A LINHA ABAIXO ESTAVA FALTANDO!
import { Container, Form } from './styles';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return alert('Preencha todos os campos!');
    }

    try {
      setLoading(true);
      await signUp({ name, email, password });
      alert('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (error) {
      alert('Ocorreu um erro ao fazer o cadastro, tente novamente.');
      console.error("Erro no cadastro:", error); // Adicionado para facilitar depuração
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleRegister}>
        <h1>Crie sua Conta</h1>
        <Input
          placeholder="Nome Completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          Cadastrar
        </Button>
        <Link to="/">Já tenho uma conta</Link>
      </Form>
    </Container>
  );
}

export default Register;