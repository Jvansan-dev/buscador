// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// node-fetch é necessário para fazer a requisição HTTP no Node.js
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Configura o CORS para permitir requisições do seu frontend (que roda no navegador)
app.use(cors());

// Endpoint de Proxy Genérico
// Captura requisições enviadas do frontend e as redireciona para o TMDB
app.get('/api/tmdb-proxy/*', async (req, res) => {
    if (!TMDB_API_KEY) {
        return res.status(500).json({ error: 'TMDB_API_KEY não configurada no servidor.' });
    }

    // Pega o caminho da TMDB (ex: /search/movie ou /genre/movie/list)
    const tmdbPath = req.params[0];

    // Monta a URL para o TMDB
    const tmdbUrl = new URL(`${TMDB_BASE_URL}/${tmdbPath}`);

    // Adiciona todos os parâmetros de consulta (query, language, etc.)
    for (const key in req.query) {
        tmdbUrl.searchParams.append(key, req.query[key]);
    }

    // *** O SEGREDO: Adiciona a chave de API do servidor, oculta do frontend ***
    tmdbUrl.searchParams.append('api_key', TMDB_API_KEY);

    try {
        const response = await fetch(tmdbUrl.toString());
        const data = await response.json();

        // Retorna a resposta (status e dados) para o frontend
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Erro ao buscar dados do TMDB:', error);
        res.status(500).json({ error: 'Erro de comunicação com o serviço externo.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor proxy rodando em http://localhost:${PORT}`);
});