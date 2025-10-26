import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados para o modo de EDIÇÃO DE PERFIL
    const [isEditing, setIsEditing] = useState(false);
    const [editNome, setEditNome] = useState('');
    const [editEmail, setEditEmail] = useState('');

    // --- 1. NOVOS ESTADOS PARA O FORMULÁRIO DE ALTERAR SENHA ---
    const [senhaAntiga, setSenhaAntiga] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);


    // Busca o usuário do localStorage para o Header
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                navigate('/login');
            }
        } catch (e) {
            console.error("Erro ao processar dados do usuário:", e);
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    // Busca os dados do perfil da API
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await api.get('/users/profile');
                setProfileData(response.data);
                setEditNome(response.data.nome);
                setEditEmail(response.data.email);
            } catch (err) {
                console.error("Erro ao buscar perfil:", err);
                setError("Não foi possível carregar os dados do perfil.");
                toast.error("Não foi possível carregar os dados do perfil.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- FUNÇÃO PARA ATIVAR O MODO DE EDIÇÃO ---
    const handleEditClick = () => {
        setEditNome(profileData.nome);
        setEditEmail(profileData.email);
        setIsEditing(true);
    };

    // --- FUNÇÃO PARA CANCELAR A EDIÇÃO ---
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditNome(profileData.nome);
        setEditEmail(profileData.email);
    };

    // --- FUNÇÃO PARA SALVAR AS ALTERAÇÕES DO PERFIL ---
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.put('/users/profile', {
                nome: editNome,
                email: editEmail,
            });

            setProfileData(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);

            toast.success('Perfil atualizado com sucesso!');
            setIsEditing(false);
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            toast.error(err.response?.data?.message || "Não foi possível atualizar o perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. FUNÇÃO PARA LIDAR COM A ALTERAÇÃO DE SENHA ---
    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (novaSenha !== confirmarNovaSenha) {
            toast.error('As novas senhas não coincidem.');
            return;
        }

        setIsPasswordLoading(true);
        try {
            await api.put('/users/change-password', {
                senhaAntiga,
                novaSenha,
            });

            toast.success('Senha alterada com sucesso!');
            // Limpa os campos após o sucesso
            setSenhaAntiga('');
            setNovaSenha('');
            setConfirmarNovaSenha('');
        } catch (err) {
            console.error("Erro ao alterar senha:", err);
            toast.error(err.response?.data?.message || "Não foi possível alterar a senha.");
        } finally {
            setIsPasswordLoading(false);
        }
    };


    if (!user) {
         return <div className="loading-fullpage">Carregando...</div>;
    }

    return (
        <div className="profile-page-wrapper">
            <Header user={user} handleLogout={handleLogout} />

            <main className="profile-content">
                <div className="content-header">
                    <h1>Meu Perfil</h1>
                </div>

                {isLoading && !profileData ? (
                    <p>Carregando perfil...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : profileData ? (
                    <>
                        {/* --- Card 1: Editar Perfil --- */}
                        <div className="profile-details-card">
                            {!isEditing ? (
                                <>
                                    <div className="profile-field">
                                        <label>Nome:</label>
                                        <span>{profileData.nome}</span>
                                    </div>
                                    <div className="profile-field">
                                        <label>E-mail:</label>
                                        <span>{profileData.email}</span>
                                    </div>
                                    <div className="profile-actions">
                                        <button className="profile-button" onClick={handleEditClick} disabled={isLoading}>
                                            {isLoading ? 'Salvando...' : 'Editar Perfil'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleSaveProfile}>
                                    <div className="form-group">
                                        <label htmlFor="nome">Nome:</label>
                                        <input type="text" id="nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">E-mail:</label>
                                        <input type="email" id="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                                    </div>
                                    <div className="profile-actions">
                                        <button type="submit" className="profile-button save-btn" disabled={isLoading}>
                                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                        <button type="button" className="profile-button cancel-btn" onClick={handleCancelEdit} disabled={isLoading}>
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* --- Card 2: Alterar Senha (NOVO) --- */}
                        <div className="profile-details-card">
                            <h3>Alterar Senha</h3>
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label htmlFor="senhaAntiga">Senha Atual</label>
                                    <input
                                        type="password"
                                        id="senhaAntiga"
                                        value={senhaAntiga}
                                        onChange={(e) => setSenhaAntiga(e.target.value)}
                                        placeholder="Digite sua senha atual"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="novaSenha">Nova Senha</label>
                                    <input
                                        type="password"
                                        id="novaSenha"
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        placeholder="Digite a nova senha"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        id="confirmarNovaSenha"
                                        value={confirmarNovaSenha}
                                        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                                        placeholder="Confirme a nova senha"
                                        required
                                    />
                                </div>
                                <div className="profile-actions">
                                    <button type="submit" className="profile-button" disabled={isPasswordLoading}>
                                        {isPasswordLoading ? 'Salvando...' : 'Alterar Senha'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                     <p>Nenhum dado de perfil encontrado.</p>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;