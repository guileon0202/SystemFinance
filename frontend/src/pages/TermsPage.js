import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
    const pageStyle = {
        fontFamily: "'Poppins', sans-serif",
        lineHeight: '1.6',
        padding: '2rem 4rem',
        maxWidth: '800px',
        margin: '0 auto',
    };

    return (
        <div style={pageStyle}>
            <h2>Termos e Condições de Uso - Web Finanças</h2>
            <p><strong>Última atualização: 18 de Outubro de 2025</strong></p>

            <p>Bem-vindo ao Web Finanças! Estes termos e condições descrevem as regras para usar nosso serviço de gerenciamento financeiro pessoal.</p>

            <h4>1. Aceitação dos Termos</h4>
            <p>Ao criar uma conta e utilizar o Web Finanças, você concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte dos termos, não poderá usar nosso serviço.</p>

            <h4>2. Descrição do Serviço</h4>
            <p>O Web Finanças é uma plataforma projetada para ajudar os usuários a registrar, categorizar e analisar suas finanças pessoais. As funcionalidades incluem, mas não se limitam a, registro de receitas e despesas, visualização de resumos e gráficos financeiros.</p>

            <h4>3. Responsabilidades do Usuário</h4>
            <ul>
                <li>Você é responsável por manter a segurança de sua conta e senha.</li>
                <li>Você é responsável pela veracidade e exatidão das informações financeiras que insere na plataforma.</li>
                <li>Você concorda em não usar o serviço para quaisquer fins ilegais ou não autorizados.</li>
            </ul>

            <h4>4. Isenção de Responsabilidade</h4>
            <p>O Web Finanças é fornecido "no estado em que se encontra". Nós não oferecemos garantias de que o serviço será ininterrupto ou livre de erros. As análises e os dados fornecidos pela plataforma são para fins informativos e não devem ser considerados como aconselhamento financeiro profissional. Você é o único responsável por suas decisões financeiras.</p>

            <h4>5. Limitação de Responsabilidade</h4>
            <p>Em nenhuma circunstância o desenvolvedor (LGSoftware) será responsável por quaisquer perdas ou danos, diretos ou indiretos, resultantes do uso ou da incapacidade de usar o serviço, incluindo a perda de dados financeiros.</p>
            
            <h4>6. Modificações nos Termos</h4>
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre as alterações publicando os novos termos no site. É sua responsabilidade revisar os Termos de Uso periodicamente.</p>

            <h4>7. Contato</h4>
            <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco pelo e-mail: webfinancepfc@gmail.com.</p>
            
            <br />
            <Link to="/register">Voltar para a página de Cadastro</Link>
        </div>
    );
};

export default TermsPage;