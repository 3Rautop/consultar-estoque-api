async function fazerRequisicao(endpoint) {
    try {
        const urlDoServidor = 'https://seu-servidor-na-nuvem.com/' + endpoint;
        const response = await fetch(urlDoServidor);
        const resultado = await response.json();
        
        // Exibe o resultado na tela
        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.innerHTML = '<h2>Resultado:</h2><pre>' + JSON.stringify(resultado, null, 2) + '</pre>';
        
    } catch (erro) {
        alert('Ocorreu um erro. Verifique se o servidor está ativo.');
        console.error('Erro:', erro);
    }
}

document.getElementById('btnConsultar').addEventListener('click', () => {
    fazerRequisicao('consultar');
});

document.getElementById('btnComparar').addEventListener('click', () => {
    fazerRequisicao('comparar');
});

document.getElementById('btnAtualizar').addEventListener('click', () => {
    fazerRequisicao('atualizar');
});
