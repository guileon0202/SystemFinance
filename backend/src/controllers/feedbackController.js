const Filter = require('bad-words');
const filter = new Filter();
filter.addWords('foda-se', 'negro', 'ridiculo', 'odio');


const FeedbackRepository = require('../models/FeedbackRepository');
const UserRepository = require('../models/UserRepository');


// FUNÇÃO PEGAR FEEDBACK
async function getFeedbacks(req, res) {
    try {
        const feedbacks = await FeedbackRepository.getAllFeedbacks();
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Erro ao buscar feedbacks:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO CREATE
async function createFeedback(req, res) {
    const userId = req.userId;
    const { titulo, descricao } = req.body;

    if (!titulo || !descricao) {
        return res.status(400).json({ message: 'O título e a descrição são obrigatórios.' });
    }

    if (filter.isProfane(titulo) || filter.isProfane(descricao)) {
        return res.status(400).json({
            message: 'O seu feedback contém linguagem imprópria e não foi enviado.'
        });
    }

    try {
        const user = await UserRepository.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const autor = user.nome;

        const newFeedback = await FeedbackRepository.createFeedback(
            titulo,
            descricao,
            autor,
            userId
        );

        res.status(201).json(newFeedback);

    } catch (error) {
        console.error('Erro ao criar feedback:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

//  FUNÇÃO UPDATE STATUS
async function updateFeedbackStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['analisando', 'desenvolvendo', 'entregue'].includes(status)) {
        return res.status(400).json({ message: 'Status inválido.' });
    }

    try {
        const updatedFeedback = await FeedbackRepository.updateStatus(id, status);

        if (!updatedFeedback) {
            return res.status(404).json({ message: 'Feedback não encontrado.' });
        }

        res.status(200).json(updatedFeedback);

    } catch (error) {
        console.error('Erro ao atualizar status do feedback:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

module.exports = {
    getFeedbacks,
    createFeedback,
    updateFeedbackStatus,
};