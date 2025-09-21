const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 👉 Token
function obterToken() {
  const configPath = path.join(__dirname, "API3R", "config.json");
  return JSON.parse(fs.readFileSync(configPath, "utf8")).access_token;
}

// 👉 Busca todos os anúncios
async function buscarTodosAnuncios(token) {
  const userRes = await axios.get("https://api.mercadolibre.com/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userId = userRes.data.id;

  const limite = 50;
  let offset = 0;
  let todos = [];

  while (true) {
    const url = `https://api.mercadolibre.com/users/${userId}/items/search?offset=${offset}&limit=${limite}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const ids = res.data.results;
    if (!ids.length) break;

    // ✅ Quebra em blocos de até 20 para respeitar o limite da API
    for (let i = 0; i < ids.length; i += 20) {
      const bloco = ids.slice(i, i + 20);
      const detalhes = await axios.get(`https://api.mercadolibre.com/items?ids=${bloco.join(",")}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      todos.push(...detalhes.data.map(item => item.body));
    }

    offset += limite;

    if (offset >= 10000) {
      console.warn("⚠️ Parando em 10.000 anúncios (limite da API)");
      break;
    }
  }

  return todos;
}

// 👉 Apenas busca e lista os anúncios
(async () => {
  const token = obterToken();
  const anuncios = await buscarTodosAnuncios(token);
  
  console.log("✅ Busca de anúncios concluída. Total de anúncios encontrados: " + anuncios.length);
  for (const anuncio of anuncios) {
    if (anuncio && !anuncio.error) {
      console.log(`➡️ ID: ${anuncio.id} | Título: ${anuncio.title}`);
    }
  }
})();
