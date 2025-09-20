import styled from 'styled-components';

export const Container = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textTitle};
  border-radius: 5px;
  border: 0;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(0.9);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;