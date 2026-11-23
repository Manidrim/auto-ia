import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const FORBIDDEN_PREFIX = ".github/workflows/";
const PLACEHOLDER_PATH = /chemin|exemple|placeholder|fichier\.ext/i;

export function validatePlan(plan, fileContents) {
  if (
    !plan ||
    typeof plan !== "object" ||
    !Array.isArray(plan.files) ||
    plan.files.length === 0
  ) {
    throw new Error('Le JSON reçu doit contenir un tableau "files" non vide');
  }
  const before = plan.files.length;
  const files = plan.files.filter(
    (f) =>
      !(f && typeof f.path === "string" && f.path.startsWith(FORBIDDEN_PREFIX)),
  );
  if (files.length < before) {
    console.log(
      `${before - files.length} fichier(s) ${FORBIDDEN_PREFIX} retirés du plan (permission workflows manquante)`,
    );
  }
  if (files.length === 0) {
    throw new Error(
      `Le plan ne contient que des fichiers ${FORBIDDEN_PREFIX}, interdits (permission manquante)`,
    );
  }
  for (const file of files) {
    if (
      !file ||
      typeof file.path !== "string" ||
      typeof file.content !== "string"
    ) {
      throw new Error(
        'Chaque entrée de "files" doit avoir "path" et "content" (chaînes de caractères)',
      );
    }
    if (
      file.path.startsWith("/") ||
      file.path.split("/").includes("..") ||
      PLACEHOLDER_PATH.test(file.path)
    ) {
      throw new Error(
        `Chemin de fichier invalide : ${JSON.stringify(file.path)}`,
      );
    }
  }
  const changed = files.filter((f) => fileContents[f.path] !== f.content);
  if (changed.length === 0) {
    throw new Error(
      "Aucun fichier ne serait réellement modifié (contenus identiques aux fichiers actuels)",
    );
  }
  return { ...plan, files };
}

export async function obtainPlan(
  conversation,
  chatJson,
  fileContents,
  attempts = 3,
) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return validatePlan(await chatJson(conversation), fileContents);
    } catch (err) {
      lastError = err;
      console.log(
        `Plan invalide (tentative ${attempt}/${attempts}) : ${err.message}`,
      );
      conversation.push({
        role: "user",
        content:
          `Ta réponse précédente n'a pas pu être utilisée : ${err.message}. ` +
          "Réponds à nouveau UNIQUEMENT avec l'objet JSON demandé, avec de vrais chemins de fichiers du projet.",
      });
    }
  }
  throw lastError;
}

export function applyPlanFiles(files) {
  for (const file of files) {
    mkdirSync(dirname(file.path), { recursive: true });
    writeFileSync(file.path, file.content);
  }
}
