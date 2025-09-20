import styled from 'styled-components';

export const InputWrapper = styled.input`
  width: 100%;
  padding: 14px;
  background-color: ${({ theme }) => theme.colors.shape};
  color: ${({ theme }) => theme.colors.textBody};
  border-radius: 5px;
  border: 1px solid #222;
  font-size: 16px;
  margin-bottom: 10px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;