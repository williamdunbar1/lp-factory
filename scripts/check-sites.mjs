import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (message) => errors.push(message);
const read = (relative) => readFile(path.join(root, relative), 'utf8');
const exists = async (relative) => {
  try { await stat(path.join(root, relative)); return true; } catch { return false; }
};
async function validateJson(relative) {
  try { return JSON.parse((await read(relative)).replace(/^\uFEFF/, '')); }
  catch (error) { fail(`${relative}: JSON inválido (${error.message})`); return null; }
}

const jsonFiles = ['leads/pipeline.json', 'templates/presets/catalog.json'];
try {
  for (const file of await readdir(path.join(root, 'leads/briefings'))) {
    if (file.endsWith('.json')) jsonFiles.push(`leads/briefings/${file}`);
  }
} catch (error) { fail(`leads/briefings: não foi possível listar (${error.message})`); }
for (const file of jsonFiles) await validateJson(file);
const catalog = await validateJson('templates/presets/catalog.json');
const presetIds = new Set();
if (!Array.isArray(catalog)) fail('templates/presets/catalog.json: esperado um array de presets');
else {
  for (const preset of catalog) {
    if (!preset || typeof preset.id !== 'string') { fail('catalog.json: preset sem id válido'); continue; }
    if (presetIds.has(preset.id)) fail(`catalog.json: id duplicado "${preset.id}"`);
    presetIds.add(preset.id);
    const directory = `templates/presets/${preset.id}`;
    for (const name of ['index.html', 'styles.css', 'script.js']) {
      if (!await exists(`${directory}/${name}`)) fail(`${directory}/${name}: arquivo obrigatório ausente`);
    }
    if (!Array.isArray(preset.files)) fail(`${directory}: catalog.json não declara files`);
    else for (const file of preset.files) if (!await exists(`${directory}/${file}`)) fail(`${directory}/${file}: arquivo declarado no catálogo ausente`);
  }
}
try {
  const presetDirectories = (await readdir(path.join(root, 'templates/presets'), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  for (const id of presetDirectories) if (!presetIds.has(id)) fail(`templates/presets/${id}: preset não listado no catalog.json`);
  for (const id of presetIds) if (!presetDirectories.includes(id)) fail(`catalog.json: preset ${id} não existe em templates/presets/`);
} catch (error) { fail(`templates/presets: não foi possível listar (${error.message})`); }

let siteSlugs = [];
try {
  siteSlugs = (await readdir(path.join(root, 'sites'), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
} catch (error) { fail(`sites/: não foi possível listar (${error.message})`); }
for (const slug of siteSlugs) {
  const directory = `sites/${slug}`;
  const sources = {};
  for (const name of ['index.html', 'styles.css', 'script.js']) {
    const relative = `${directory}/${name}`;
    if (!await exists(relative)) { fail(`${relative}: arquivo obrigatório ausente`); continue; }
    try { sources[name] = await read(relative); } catch (error) { fail(`${relative}: ${error.message}`); }
  }
  for (const [name, source] of Object.entries(sources)) {
    if (source.includes('{{')) fail(`${directory}/${name}: placeholder "{{" encontrado`);
    if (/\b[A-Za-z]:\\/.test(source)) fail(`${directory}/${name}: caminho Windows local encontrado`);
  }
  const html = sources['index.html'] ?? '';
  const css = sources['styles.css'] ?? '';
  const imageRefs = [];
  for (const match of html.matchAll(/\bsrc\s*=\s*(["'])(assets\/[^"']+)\1/gi)) imageRefs.push(match[2]);
  for (const match of css.matchAll(/url\(\s*(["']?)(assets\/[^"')]+)\1\s*\)/gi)) imageRefs.push(match[2]);
  for (const image of new Set(imageRefs)) if (!await exists(`${directory}/${image}`)) fail(`${directory}: imagem local ausente: ${image}`);
  for (const match of html.matchAll(/<svg\b[^>]*>/gi)) {
    if (!/\bwidth\s*=\s*(["'])[^"']+\1/i.test(match[0]) || !/\bheight\s*=\s*(["'])[^"']+\1/i.test(match[0])) fail(`${directory}/index.html: <svg> sem width e height explícitos`);
  }
  if (!/https:\/\/wa\.me\/\d{10,15}(?:[/?#]|$)/i.test(html)) fail(`${directory}/index.html: link https://wa.me/ com DDI e número numérico válido ausente`);
  if (!/<iframe\b[^>]*\bsrc\s*=\s*(["'])https?:\/\/(?:maps\.google\.[^"']*|(?:www\.)?google\.[^"']*maps)/i.test(html)) fail(`${directory}/index.html: iframe do Google Maps ausente`);
  if (!/scroll-margin-top\s*:/i.test(css)) fail(`${directory}/styles.css: scroll-margin-top ausente`);
  if (!/white-space\s*:\s*nowrap\b/i.test(css)) fail(`${directory}/styles.css: white-space: nowrap do CTA ausente`);
  if (!/@media\s*\(\s*max-width\s*:/i.test(css) || !/@media[\s\S]*?\.site-header\s+nav\s*\{[^}]*display\s*:\s*none/i.test(css)) fail(`${directory}/styles.css: regra mobile não esconde o nav`);
}
if (errors.length) {
  console.error(`Validação falhou: ${errors.length} erro(s).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else console.log(`Validação concluída: ${siteSlugs.length} sites, ${presetIds.size} presets e ${jsonFiles.length} arquivos JSON sem erros.`);
