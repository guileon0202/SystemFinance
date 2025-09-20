import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.colors.shape};
  padding: 40px;
  border-radius: 8px;

  h1 {
    text-align: center;
    margin-bottom: 24px;
    color: ${({ theme }) => theme.colors.primary};
  }

  a {
    margin-top: 24px;
    color: ${({ theme }) => theme.colors.textLight};
    text-align: center;
    font-size: 14px;
    transition: color 0.2s;

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;