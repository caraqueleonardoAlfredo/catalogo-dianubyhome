// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Home from "../app/page";

describe("DianubyHome catalog interactions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("changes Gota photography with its Touch, Gestual and Presencia variants", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Ver detalles de Gota" }));
    const dialog = screen.getByRole("dialog", { name: "Detalle de Gota" });
    expect(within(dialog).getByAltText("Espejo Gota con touch")).toBeTruthy();

    await user.click(within(dialog).getByRole("button", { name: /Sensor gestual/ }));
    expect(within(dialog).getByAltText("Espejo Gota con sensor gestual")).toBeTruthy();

    await user.click(within(dialog).getByRole("button", { name: /Sensor de presencia/ }));
    expect(within(dialog).getByAltText("Espejo Gota con sensor de presencia")).toBeTruthy();
  });

  it("keeps visual mappings for Lumen Sensor and Cápsula Display", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Ver detalles de Lumen Sensor" }));
    let dialog = screen.getByRole("dialog", { name: "Detalle de Lumen Sensor" });
    await user.click(within(dialog).getByRole("button", { name: /Redondo 60/ }));
    expect(within(dialog).getByAltText("Lumen redondo con sensor de presencia")).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Cerrar detalle" }));

    await user.click(screen.getByRole("button", { name: "Ver detalles de Cápsula Display" }));
    dialog = screen.getByRole("dialog", { name: "Detalle de Cápsula Display" });
    await user.click(within(dialog).getByRole("button", { name: /Borde pulido/ }));
    expect(within(dialog).getByAltText("Cápsula Display con borde pulido")).toBeTruthy();
  });

  it("builds and persists a detailed WhatsApp order", async () => {
    const user = userEvent.setup();
    const view = render(<Home />);

    await user.click(screen.getByRole("button", { name: "Ver detalles de Gota" }));
    const productDialog = screen.getByRole("dialog", { name: "Detalle de Gota" });
    await user.click(within(productDialog).getByRole("button", { name: /Sensor gestual/ }));
    await user.click(within(productDialog).getByRole("button", { name: "Sumar una unidad" }));
    await user.click(within(productDialog).getByRole("button", { name: "Sumar una unidad" }));
    await user.click(within(productDialog).getByRole("button", { name: /Agregar al pedido/ }));

    const cart = screen.getByRole("dialog", { name: "Mi pedido" });
    expect(within(cart).getByText("Gota")).toBeTruthy();
    expect(within(cart).getByText("Sensor gestual")).toBeTruthy();
    expect(within(cart).getByText(/Faltan 12 unidades/)).toBeTruthy();

    const whatsapp = within(cart).getByRole("link", { name: /Enviar pedido por WhatsApp/ });
    expect(whatsapp.getAttribute("href")).toContain("https://wa.me/5493863536486?text=");
    const message = new URL(whatsapp.getAttribute("href")!).searchParams.get("text")!;
    expect(message).toContain("3 × Gota (Sensor gestual)");
    expect(message).toContain("Total de unidades: 3");
    expect(message).toContain("Total estimado:");

    await waitFor(() => {
      expect(window.localStorage.getItem("dianuby-cart")).toContain('"quantity":3');
    });

    view.unmount();
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Ver pedido, 3 unidades/ })).toBeTruthy();
    });
  });
});
