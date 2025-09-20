import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components'; // Importante
import { AuthProvider } from './contexts/AuthContext';

import AppRoutes from './routes';
import GlobalStyle from './styles/global';
import theme from './styles/theme'; // Importante

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}> {/* Precisa estar aqui */}
        <AuthProvider>
          <GlobalStyle />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;