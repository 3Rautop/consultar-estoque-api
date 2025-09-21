const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

// 👉 Lê a planilha e gera um mapa
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

// 👉 Carrega o resultado da busca
function carregarResultadoDaBusca() {
  const caminho = path.join(__dirname, "verificacao_resultado.json");
  return JSON.parse(fs.readFileSync(caminho, "utf8"));
}

// 👉 Compara o estoque
(async () => {
  console.log("🔁 Comparando estoque...");

  const estoquePlanilha = carregarEstoquePlanilha();
  const resultadoBusca = carregarResultadoDaBusca();
  let divergencias = 0;

  for (const anuncio of resultadoBusca) {
    if (!anuncio.sku) continue;

    const sku = anuncio.sku;
    const estoquePlan = estoquePlanilha[sku];
    const estoqueML = anuncio.available_quantity;

    if (estoquePlan === undefined) {
      console.warn(`⚠️ SKU ${sku} não encontrado na planilha.`);
      continue;
    }

    if (estoqueML !== estoquePlan) {
      divergencias++;
      console.log(`❌ Divergente → SKU: ${sku} | Planilha: ${estoquePlan} | ML: ${estoqueML}`);
    }
  }

  console.log(`✅ Comparação concluída. Divergências encontradas: ${divergencias}`);
})();
