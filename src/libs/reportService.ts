"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AppData } from "@/store/plantStore";

/**
 * Servicio de Generación de Reportes PDF (Data-Only)
 * Focado en legibilidad técnica y datos puros.
 */
export const generateFullReport = (data: AppData, userName: string) => {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("es-AR");

  // --- Título del Reporte ---
  doc.setFontSize(18);
  doc.text("Reporte de Gestión Botánica - PlantitasApp", 14, 20);
  doc.setFontSize(10);
  doc.text(`Usuario: ${userName} | Fecha: ${now}`, 14, 28);

  let currentY = 35;

  // --- 1. MIS PLANTAS ---
  doc.setFontSize(14);
  doc.text("1. Catálogo de Plantas", 14, currentY);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [["Nombre", "Tipo", "Ubicación", "Luz", "Últ. Riego"]],
    body: data.plants.map((p) => [
      p.name,
      p.subtype ? `${p.type} (${p.subtype})` : p.type,
      p.location,
      p.light,
      p.lastWateredDate || "Nunca",
    ]),
    theme: "grid",
    headStyles: { fillColor: [46, 125, 50] }, // Verde botánico
  });

  // --- 2. PROPAGACIONES ---
  currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("2. Laboratorio de Propagación", 14, currentY);

  autoTable(doc, {
    startY: currentY + 5,
    head: [["Nombre", "Método", "Inicio", "Estado", "Notas"]],
    body: data.propagations.map((pr) => [
      pr.name,
      pr.method,
      pr.startDate,
      pr.status,
      pr.notes,
    ]),
    theme: "grid",
    headStyles: { fillColor: [21, 101, 192] }, // Azul laboratorio
  });

  // --- 3. INVENTARIO ---
  currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("3. Auditoría de Inventario", 14, currentY);

  const inventoryRows: any[] = [];
  Object.entries(data.inventory).forEach(([cat, items]) => {
    items.forEach((i) => {
      inventoryRows.push([cat.toUpperCase(), i.name, `${i.qty} ${i.unit}`]);
    });
  });

  autoTable(doc, {
    startY: currentY + 5,
    head: [["Categoría", "Insumo", "Cantidad"]],
    body: inventoryRows,
    theme: "grid",
    headStyles: { fillColor: [216, 67, 21] }, // Naranja insumos
  });

  // --- 4. TAREAS ESTACIONALES ---
  currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("4. Agenda de Temporada", 14, currentY);

  const taskRows: any[] = [];
  Object.entries(data.seasonalTasks).forEach(([season, tasks]) => {
    tasks.forEach((t) => {
      taskRows.push([season, t.type, t.desc]);
    });
  });

  autoTable(doc, {
    startY: currentY + 5,
    head: [["Temporada", "Tipo Tarea", "Descripción"]],
    body: taskRows,
    theme: "grid",
    headStyles: { fillColor: [102, 187, 106] },
  });

  // --- 5. DESEOS Y NOTAS (Mini Tablas) ---
  doc.addPage();
  currentY = 20;

  doc.setFontSize(14);
  doc.text("5. Lista de Deseos", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [["Prioridad", "Planta Deseada", "Notas"]],
    body: data.wishlist.map((w) => [w.priority, w.name, w.notes]),
    theme: "grid",
    headStyles: { fillColor: [249, 168, 37] },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("6. Bitácora de Notas Globales", 14, currentY);
  autoTable(doc, {
    startY: currentY + 5,
    head: [["ID", "Contenido"]],
    body: data.globalNotes.map((n) => [n.id, n.content]),
    theme: "grid",
    headStyles: { fillColor: [120, 144, 156] },
  });

  // --- Descarga ---
  doc.save(`Reporte_PlantitasApp_${new Date().toISOString().split("T")[0]}.pdf`);
};
