const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const axios = require("axios");
const { access_token } = require("./API3R");

// 👉 Lê a planilha e gera um mapa com o estoque
function carregarEstoquePlanilha() {
  const caminho = path.join(__dirname, "itens_3884.xlsx");
  const workbook = xlsx.readFile(caminho);
  const planilha = workbook.Sheets[workbook.SheetNames[0]];
  const dados = xlsx.utils.sheet_to_json(planilha);
  
  const estoque = {};
  for (const item of dados) {
    if (!item.cd_item || item.saldo == null) continue;
    const sku = "3R" + item.cd_item;
    estoque[sku] = parseInt(item.saldo) || 0;
  }
  return estoque;
}

// 👉 Encontra o SKU e o ID do item
async function buscarIdDoAnuncio(sku, token) {
  const url = `https://api.mercadolibre.com/sites/MLB/search?seller_id=me&q=${sku}`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Retorna o ID do primeiro resultado que bater com o SKU exato
  const item = res.data.results.find(item => {
    const attr = item.attributes?.find(a => a.id === "SELLER_SKU");
    return attr?.value_name === sku;
  });
  
  return item?.id;
}

// 👉 Atualiza o estoque no Mercado Livre
async function atualizarEstoque() {
  console.log("🔁 Iniciando atualização de estoque...");
  const estoquePlanilha = carregarEstoquePlanilha();
  
  for (const sku in estoquePlanilha) {
    const novoEstoque = estoquePlanilha[sku];
    
    if (novoEstoque < 0) {
        console.warn(`⚠️ SKU ${sku}: Estoque negativo na planilha. Pulando...`);
        continue;
    }
    
    try {
      const itemId = await buscarIdDoAnuncio(sku, access_token);
      if (!itemId) {
        console.warn(`⚠️ SKU ${sku}: Não encontrado no Mercado Livre. Pulando...`);
        continue;
      }
      
      const updateUrl = `https://api.mercadolibre.com/items/${itemId}`;
      const payload = {
        available_quantity: novoEstoque
      };
      
      await axios.put(updateUrl, payload, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      console.log(`✅ SKU ${sku}: Estoque atualizado para ${novoEstoque}`);

    } catch (err) {
      console.error(`❌ Erro ao atualizar SKU ${sku}:`, err.response?.data?.message || err.message);
    }
  }
  
  console.log("✅ Atualização de estoque concluída.");
}

atualizarEstoque();
