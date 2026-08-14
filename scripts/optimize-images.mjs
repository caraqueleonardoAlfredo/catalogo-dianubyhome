import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicSource = path.join(projectRoot, "public", "images", "imagenes para catalogo mayorista");
const backupSource = path.join(projectRoot, ".image-originals", "imagenes para catalogo mayorista");
const outputRoot = path.join(projectRoot, "public", "images", "products");
const reportPath = path.join(projectRoot, "reports", "image-optimization.json");

const images = [
  ["aura-1", "Redondo touch/ChatGPT Image Aug 13, 2026, 04_44_28 PM.png"],
  ["aura-2", "Redondo touch/ChatGPT Image Aug 13, 2026, 04_56_52 PM.png"],
  ["aura-3", "Redondo touch/ChatGPT Image Aug 13, 2026, 05_22_30 PM.png"],
  ["eclipse-1", "Redondo dispay/ChatGPT Image Aug 13, 2026, 03_49_25 PM - Copy.png"],
  ["eclipse-2", "Redondo dispay/ChatGPT Image Aug 13, 2026, 03_49_45 PM - Copy.png"],
  ["eclipse-3", "Redondo dispay/ChatGPT Image Aug 13, 2026, 03_50_16 PM (1) - Copy.png"],
  ["eclipse-4", "Redondo dispay/ChatGPT Image Aug 13, 2026, 03_50_17 PM (2).png"],
  ["eclipse-5", "Redondo dispay/ChatGPT Image Aug 13, 2026, 04_51_48 PM - Copy.png"],
  ["nova-1", "Rectangular pantalla/ChatGPT Image Aug 13, 2026, 03_54_06 PM.png"],
  ["nova-2", "Rectangular pantalla/ChatGPT Image Aug 13, 2026, 04_26_14 PM.png"],
  ["nova-3", "Rectangular pantalla/ChatGPT Image Aug 13, 2026, 03_51_34 PM.png"],
  ["nova-4", "Rectangular pantalla/ChatGPT Image Aug 13, 2026, 03_53_10 PM.png"],
  ["nova-5", "Rectangular pantalla/ChatGPT Image Aug 13, 2026, 03_53_26 PM.png"],
  ["nova-6", "Rectangular pantalla/ChatGPT Image Aug 13, 2026, 03_53_35 PM.png"],
  ["colgante-1", "Colgante/3.png"],
  ["colgante-2", "Colgante/4.png"],
  ["colgante-3", "Colgante/ChatGPT Image Aug 13, 2026, 04_58_22 PM.png"],
  ["halo-1", "Redondo sensor de movimiento/ChatGPT Image Aug 13, 2026, 05_32_23 PM.png"],
  ["halo-2", "Redondo sensor de movimiento/ChatGPT Image Aug 13, 2026, 05_37_07 PM.png"],
  ["halo-3", "Redondo sensor de movimiento/ChatGPT Image Aug 13, 2026, 06_19_24 PM.png"],
  ["lumen-1", "Rectangular sensor de presencia/ChatGPT Image Aug 13, 2026, 06_43_40 PM.png"],
  ["lumen-2", "Rectangular sensor de presencia/ChatGPT Image Aug 13, 2026, 06_45_40 PM.png"],
  ["lumen-3", "Rectangular sensor de presencia/referencia para baño consultorio.png"],
  ["lumen-4", "Rectangular sensor de presencia/exec-000c8f3b-0e71-48ff-9290-48e90b4b46ca.png"],
  ["lumen-5", "Redondo sensor de presencia/ChatGPT Image Aug 13, 2026, 07_08_47 PM (1).png"],
  ["lumen-6", "Redondo sensor de presencia/ChatGPT Image Aug 13, 2026, 07_13_33 PM.png"],
  ["capsula-1", "Pildora display/pildora marco negro/1.png"],
  ["capsula-2", "Pildora display/pildora marco negro/4.png"],
  ["capsula-3", "Pildora display/pildora marco pulido/ChatGPT Image Aug 13, 2026, 07_48_59 PM.png"],
  ["arco-1", "Medio punto 70x50/Touch/ChatGPT Image Aug 14, 2026, 11_18_48 AM.png"],
  ["gota-1", "Gota 70x50/Touch/ChatGPT Image Aug 14, 2026, 11_25_12 AM.png"],
  ["gota-2", "Gota 70x50/Sensor gestual/ChatGPT Image Aug 14, 2026, 11_41_45 AM.png"],
  ["gota-3", "Gota 70x50/Sensor de presencia/ChatGPT Image Aug 14, 2026, 11_33_19 AM.png"],
];

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
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

if (!await exists(backupSource)) {
  await mkdir(path.dirname(backupSource), { recursive: true });
  await cp(publicSource, backupSource, { recursive: true });
}

const sourceRoot = backupSource;
await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });

const usedSources = new Set(images.map(([, source]) => source.replaceAll("\\", "/")));
const duplicateSource = "Pildora display/pildora marco pulido/4.png";
const referencedSources = new Set([...usedSources, duplicateSource]);
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

  await basePipeline()
    .resize({ width: 760, height: 760, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, alphaQuality: 80, effort: 6, smartSubsample: true })
    .toFile(thumbnailPath);

  await basePipeline()
    .resize({ width: 1500, height: 1500, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 82, effort: 6, smartSubsample: true })
    .toFile(largePath);

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
  knownDuplicate: {
    canonical: "Pildora display/pildora marco negro/4.png",
    duplicate: duplicateSource,
  },
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
