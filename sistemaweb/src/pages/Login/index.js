import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Container, Form } from './styles';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return alert('Preencha todos os campos!');
    }

    try {
      setLoading(true);
      await signIn({ email, password });
      navigate('/dashboard'); // Navega após o signIn ter sucesso
    } catch (error) {
      alert('Ocorreu um erro ao fazer login, cheque as credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleLogin}>
        <h1>Web Finance</h1>
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
          Entrar
        </Button>
        <Link to="/register">Não tenho uma conta</Link>
      </Form>
    </Container>
  );
}

export default Login;