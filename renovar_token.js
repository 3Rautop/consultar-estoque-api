const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 🧠 Local do config.json
const configPath = path.join(__dirname, "API3R", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// 📡 Endpoint de renovação do Mercado Livre
const URL = "https://api.mercadolibre.com/oauth/token";

// 🔑 Dados da sua aplicação
const CLIENT_ID = config.id_app;
const CLIENT_SECRET = config.client_secret;
const REFRESH_TOKEN = config.refresh_token;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error("❌ Faltam dados no config.json (client_id, client_secret ou refresh_token)");
  process.exit(1);
}

async function renovarToken() {
  try {
    const res = await axios.post(
      URL,
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    // 📅 Calcula horário exato de expiração
    const agora = new Date();
    const expiresAt = new Date(agora.getTime() + res.data.expires_in * 1000);

    // ✏️ Atualiza e salva o config com os campos novos
    const novo = {
      ...config,
      access_token: res.data.access_token,
      refresh_token: res.data.refresh_token || config.refresh_token,
      expires_in: res.data.expires_in,
      last_refreshed: agora.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    fs.writeFileSync(configPath, JSON.stringify(novo, null, 2));
    console.log("✅ Novo token gerado e salvo com sucesso!");
    console.log(`⏳ Expira às: ${novo.expires_at}`);
  } catch (e) {
    console.error("❌ Erro ao renovar token:");
    console.error(e.response?.data || e.message);
    process.exit(1);
  }
}

renovarToken();