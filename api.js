const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());

// Função para rodar os scripts e retornar o resultado
function rodarScript(scriptNome) {
    return new Promise((resolve, reject) => {
        exec(`node ${scriptNome}.js`, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao executar ${scriptNome}:`, stderr);
                return reject({ erro: stderr });
            }
            resolve({ sucesso: true, log: stdout });
        });
    });
}

// Rota para consultar o estoque
app.get('/consultar', async (req, res) => {
    try {
        await rodarScript('renovar_token');
        const resultado = await rodarScript('verificador_anuncios');
        res.json(resultado);
    } catch (e) {
        res.status(500).json(e);
    }
});

// Rota para comparar o estoque
app.get('/comparar', async (req, res) => {
    try {
        const resultado = await rodarScript('comparar_estoque');
        res.json(resultado);
    } catch (e) {
        res.status(500).json(e);
    }
});

// Rota para atualizar o estoque
app.get('/atualizar', async (req, res) => {
    try {
        await rodarScript('renovar_token');
        const resultado = await rodarScript('atualizar_estoque');
        res.json(resultado);
    } catch (e) {
        res.status(500).json(e);
    }
});

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});