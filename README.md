Backend API
-----------

Este projeto contém o código da API (servidor) da aplicação. A aplicação utiliza o **Docker Compose** para gerenciar o ambiente de desenvolvimento, incluindo o banco de dados **PostgreSQL**.

### Pré-requisitos

Para rodar este projeto, você precisa ter instalado na sua máquina:

*   **Docker**
    
*   **Docker Compose**

*   **Node.js/NPM (para instalar dependências do backend e rodar scripts).**
    

### Configuração e Instalação

Siga estes passos para configurar e iniciar o ambiente:

1.  git clone git@github.com:guileon0202/SystemFinance.git
    
2.  Configurações do Banco de Dados:
    
    ```# Configurações do Banco de Dados
    DB_USER=postgres
    DB_HOST=localhost
    DB_DATABASE=systemfinance
    DB_PASSWORD=postgres
    DB_PORT=5432
    
    # Credenciais do Mailtrap para envio de e-mail de teste
    MAIL_HOST=sandbox.smtp.mailtrap.io
    MAIL_PORT=2525
    MAIL_USER=b1ac8e1537f0a0
    MAIL_PASS=31247b3a77edfc

    *   Crie um arquivo chamado .env na raiz do projeto com as seguintes variáveis:
        
3.  npm install ou yarn install, dependendo do seu gerenciador de pacotes
    

### Scripts Disponíveis (Execução)

O projeto é iniciado através do Docker Compose, que levanta tanto o servidor da aplicação quanto o contêiner do banco de dados.

#### docker-compose up -d

Inicia os serviços definidos no docker-compose.yml (o banco de dados db e, presumivelmente, o seu serviço de API) em **modo** _**detached**_ **(segundo plano)**.

*   O banco de dados PostgreSQL estará acessível na porta **5432**.
    
*   O serviço da API estará acessível na porta que você configurou (ex: http://localhost:3001).
    

#### npm run dev

Com os contêineres levantados, este script (presumivelmente) inicia o servidor da sua aplicação em **modo de desenvolvimento** dentro do contêiner ou na sua máquina, observando as mudanças de código.


> **Dica:** Se o seu npm run dev precisar do Docker, lembre-se de rodar o docker-compose up -d antes.

#### docker-compose logs -f

Para visualizar os logs de todos os serviços (ou de um serviço específico, como db), use:


#### docker-compose down

Para parar e remover os contêineres e redes criadas:


### Banco de Dados (PostgreSQL)

O banco de dados é gerenciado pelo serviço db no Docker Compose:

*   **Imagem:** postgres:15-alpine
    
*   **Nome do DB:** systemfinance
    
*   **Porta Local:** 5432
    

