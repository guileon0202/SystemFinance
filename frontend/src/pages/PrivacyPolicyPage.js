import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
    const pageStyle = {
        fontFamily: "'Poppins', sans-serif",
        lineHeight: '1.6',
        padding: '2rem 4rem',
        maxWidth: '800px',
        margin: '0 auto',
    };

    return (
        <div style={pageStyle}>
            <h2>Política de Privacidade - Web Finanças</h2>
            <p><strong>Última atualização: 18 de Outubro de 2025</strong></p>

            <p>A sua privacidade é importante para nós. Esta política de privacidade explica como o Web Finanças coleta, usa e protege suas informações pessoais.</p>

            <h4>1. Dados que Coletamos</h4>
            <p>Coletamos os seguintes tipos de informações:</p>
            <ul>
                <li><strong>Dados de Cadastro:</strong> Quando você cria uma conta, coletamos seu nome completo, endereço de e-mail e uma senha (que é armazenada de forma criptografada).</li>
                <li><strong>Dados Financeiros:</strong> Coletamos as informações de transações que você insere, como descrição, valor, tipo (receita/despesa), data e categoria.</li>
            </ul>

            <h4>2. Como Usamos Seus Dados</h4>
            <p>Usamos os dados coletados para:</p>
            <ul>
                <li>Fornecer e operar os serviços da plataforma, exibindo suas próprias informações financeiras para você.</li>
                <li>Autenticar seu acesso à sua conta e garantir sua segurança.</li>
                <li>Comunicar com você sobre sua conta ou atualizações do serviço (funcionalidade futura).</li>
            </ul>

            <h4>3. Compartilhamento de Dados</h4>
            <p><strong>Nós não compartilhamos, vendemos ou alugamos suas informações pessoais para terceiros.</strong> Seus dados financeiros são privados e acessíveis apenas por você através de sua conta. O acesso só será feito por administradores em casos de suporte técnico solicitado por você ou para cumprir obrigações legais.</p>

            <h4>4. Segurança dos Dados</h4>
            <p>Empregamos medidas de segurança para proteger suas informações. Suas senhas são criptografadas (hashed) e não temos acesso a elas. No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro.</p>

            <h4>5. Seus Direitos (LGPD)</h4>
            <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:</p>
            <ul>
                <li>Acessar e corrigir seus dados pessoais a qualquer momento.</li>
                <li>Solicitar a exclusão de sua conta e de todos os seus dados.</li>
            </ul>

            <h4>6. Contato</h4>
            <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco pelo e-mail: webfinancepfc@gmail.com.</p>
            
            <br />
            <Link to="/register">Voltar para a página de Cadastro</Link>
        </div>
    );
};

export default PrivacyPolicyPage;