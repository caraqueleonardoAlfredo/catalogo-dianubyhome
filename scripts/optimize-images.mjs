import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, ".image-originals", "imagenes-cuadradas-catalogo");
const outputRoot = path.join(projectRoot, "public", "images", "products");
const reportPath = path.join(projectRoot, "reports", "image-optimization.json");

const images = [
  ["aura-1", "Redondo touch/1.jpg"], ["aura-2", "Redondo touch/2.jpg"], ["aura-3", "Redondo touch/3.jpg"],
  ["eclipse-1", "Redondo dispay/1.jpg"], ["eclipse-2", "Redondo dispay/2.jpg"], ["eclipse-3", "Redondo dispay/3.jpg"], ["eclipse-4", "Redondo dispay/4.jpg"], ["eclipse-5", "Redondo dispay/5.jpg"],
  ["nova-1", "Rectangular pantalla/1.jpg"], ["nova-2", "Rectangular pantalla/2.jpg"], ["nova-3", "Rectangular pantalla/3.jpg"], ["nova-4", "Rectangular pantalla/4.jpg"], ["nova-5", "Rectangular pantalla/5.jpg"],
  ["colgante-1", "Colgante/1.jpg"], ["colgante-2", "Colgante/2.jpg"], ["colgante-3", "Colgante/3.jpg"],
  ["halo-1", "Redondo sensor de movimiento/1.jpg"], ["halo-2", "Redondo sensor de movimiento/2.jpg"], ["halo-3", "Redondo sensor de movimiento/3.jpg"],
  ["lumen-1", "Rectangular sensor de presencia/1.jpg"], ["lumen-2", "Rectangular sensor de presencia/2.jpg"], ["lumen-3", "Rectangular sensor de presencia/3.jpg"],
  ["lumen-4", "Redondo sensor de presencia/1.jpg"], ["lumen-5", "Redondo sensor de presencia/2.jpg"], ["lumen-6", "Redondo sensor de presencia/3.jpg"], ["lumen-7", "Redondo sensor de presencia/4.jpg"],
  ["capsula-1", "Pildora display/pildora marco negro/1.jpg"], ["capsula-2", "Pildora display/pildora marco negro/2.jpg"],
  ["capsula-3", "Pildora display/pildora marco pulido/1.jpg"], ["capsula-4", "Pildora display/pildora marco pulido/2.jpg"],
  ["arco-1", "Medio punto 70x50/1.jpg"],
  ["gota-1", "Gota 70x50/1.jpg"], ["gota-2", "Gota 70x50/2.jpg"], ["gota-3", "Gota 70x50/3.jpg"],
];

const excludedBlankSources = [
  "Rectangular sensor de presencia/4.jpg",
  "Rectangular sensor de presencia/5.jpg",
  "Redondo sensor de presencia/5.jpg",
];

async function exists(target) {
  try { await stat(target); return true; } catch { return false; }
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else files.push(relative.replaceAll("\\", "/"));
  }
  return files;
}

if (!await exists(sourceRoot)) throw new Error(`Missing source images: ${sourceRoot}`);

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });

const usedSources = new Set(images.map(([, source]) => source.replaceAll("\\", "/")));
const referencedSources = new Set([...usedSources, ...excludedBlankSources]);
const sourceFiles = await listFiles(sourceRoot);
const results = [];

for (const [name, source] of images) {
  const input = path.join(sourceRoot, source);
  const original = await stat(input);
  const metadata = await sharp(input).metadata();
  const stats = await sharp(input).stats();
  const preserveAlpha = Boolean(metadata.hasAlpha && !stats.isOpaque);
  const basePipeline = () => {
    const pipeline = sharp(input).rotate();
    return preserveAlpha ? pipeline : pipeline.removeAlpha();
  };

  const thumbnailPath = path.join(outputRoot, `${name}-thumb.webp`);
  const largePath = path.join(outputRoot, `${name}-large.webp`);
  await basePipeline().resize({ width: 760, height: 760, fit: "inside", withoutEnlargement: true }).webp({ quality: 78, alphaQuality: 80, effort: 6, smartSubsample: true }).toFile(thumbnailPath);
  await basePipeline().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 80, alphaQuality: 82, effort: 6, smartSubsample: true }).toFile(largePath);

  const thumbnail = await sharp(thumbnailPath).metadata();
  const large = await sharp(largePath).metadata();
  results.push({
    name,
    source: source.replaceAll("\\", "/"),
    original: { width: metadata.width, height: metadata.height, bytes: original.size },
    thumbnail: { width: thumbnail.width, height: thumbnail.height, bytes: (await stat(thumbnailPath)).size },
    large: { width: large.width, height: large.height, bytes: (await stat(largePath)).size },
    preserveAlpha,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  originalFiles: sourceFiles.length,
  usedUniqueFiles: images.length,
  unusedFiles: sourceFiles.filter((file) => !referencedSources.has(file)),
  excludedBlankSources,
  totals: {
    originalBytes: results.reduce((sum, item) => sum + item.original.bytes, 0),
    thumbnailBytes: results.reduce((sum, item) => sum + item.thumbnail.bytes, 0),
    largeBytes: results.reduce((sum, item) => sum + item.large.bytes, 0),
  },
  images: results,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.totals, null, 2));
console.log(`Generated ${results.length * 2} WebP files. Report: ${path.relative(projectRoot, reportPath)}`);
