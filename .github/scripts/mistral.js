import { request } from "https";

const API_URL = "https://api.mistral.ai/v1/chat/completions";

export function chat(messages, { model = "mistral-small-latest", maxTokens = 16384, temperature = 0.2, responseFormat } = {}) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY manquant");

  const body = JSON.stringify({
    model,
    temperature,
    max_tokens: maxTokens,
    ...(responseFormat ? { response_format: { type: responseFormat } } : {}),
    messages,
  });

  return new Promise((resolve, reject) => {
    const req = request(
      API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`Mistral API ${res.statusCode}: ${data}`));
            return;
          }
          try {
            const json = JSON.parse(data);
            const choice = json.choices[0];
            if (choice.finish_reason === "length") {
              reject(new Error("Réponse Mistral tronquée (limite max_tokens atteinte) : augmente maxTokens ou réduis la taille de la sortie demandée."));
              return;
            }
            resolve(choice.message.content);
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error(`Pas de JSON trouvé dans la réponse (début reçu : ${JSON.stringify(raw.slice(0, 200))})`);
  }
  return JSON.parse(raw.slice(start, end + 1));
}

export async function chatJson(messages, { attempts = 3, ...options } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await chat(messages, { ...options, responseFormat: "json_object" });
      return extractJson(response);
    } catch (err) {
      lastError = err;
      console.log(`Tentative ${attempt}/${attempts} échouée : ${err.message}`);
    }
  }
  throw lastError;
}
