import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const source = readFileSync(path.join(root, "app", "page.tsx"), "utf8");
const builtHtml = readFileSync(path.join(root, "dist", "index.html"), "utf8");

test("production build is a static GitHub Pages site", () => {
  assert.ok(existsSync(path.join(root, "dist", "index.html")));
  assert.match(builtHtml, /\/catalogo-dianubyhome\/assets\//);
  assert.match(builtHtml, /\/catalogo-dianubyhome\/favicon\.png/);
  assert.doesNotMatch(builtHtml, /(?:src|href)="\/(?!catalogo-dianubyhome\/)/);
});

test("all catalog images, logo and favicon exist", () => {
  const imagePaths = [...source.matchAll(/`\$\{B\}\/([^`]+\.(?:png|jpe?g|webp|svg))`/gi)]
    .map((match) => path.join(root, "public", "images", "imagenes para catalogo mayorista", match[1]));

  assert.ok(imagePaths.length > 0);
  for (const imagePath of imagePaths) {
    assert.ok(existsSync(imagePath), `Missing image: ${imagePath}`);
  }
  assert.ok(existsSync(path.join(root, "public", "logo-dianuby.png")));
  assert.ok(existsSync(path.join(root, "public", "favicon.png")));
});

test("visual variants keep their selected image mappings", () => {
  assert.match(source, /label: "Touch", price: "\$85\.000", imageIndex: 0/);
  assert.match(source, /label: "Sensor gestual", price: "\$98\.000", imageIndex: 1/);
  assert.match(source, /label: "Sensor de presencia", price: "\$98\.000", imageIndex: 2/);
  assert.match(source, /label: "Marco negro", price: "\$105\.000", imageIndex: 0/);
  assert.match(source, /label: "Borde pulido", price: "\$105\.000", imageIndex: 2/);
  assert.match(source, /variantImageIndex\(product, variantIndex\)/);
});

test("cart and wholesale order requirements remain present", () => {
  assert.match(source, /localStorage\.getItem\("dianuby-cart"\)/);
  assert.match(source, /Compra mínima de 15 unidades/);
  assert.match(source, /Pago por transferencia o efectivo/);
  assert.match(source, /50% del pedido/);
  assert.match(source, /5493863536486/);
  assert.match(source, /item\.product\.name/);
  assert.match(source, /item\.variant\.label/);
  assert.match(source, /item\.quantity/);
  assert.match(source, /Total estimado/);
});

test("all public asset URLs use Vite BASE_URL", () => {
  assert.match(source, /const BASE_URL = import\.meta\.env\.BASE_URL/);
  assert.match(source, /`\$\{BASE_URL\}images\//);
  assert.match(source, /`\$\{BASE_URL\}logo-dianuby\.png`/);
  assert.doesNotMatch(source, /["'`]\/(?:images|logo-dianuby|favicon)\//);
});
