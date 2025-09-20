import styled from 'styled-components';

export const HeaderContainer = styled.header`
  background: ${({ theme }) => theme.colors.shape};
  padding: 2rem 1rem 2rem;
`;

export const HeaderContent = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;

  span {
    color: ${({ theme }) => theme.colors.textBody};
    margin-right: 1rem;
  }

  button {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.danger};
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: all 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.danger};
      color: ${({ theme }) => theme.colors.textTitle};
    }
  }
`;