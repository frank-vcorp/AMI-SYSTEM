# Cronograma General de Desarrollo – RD-AMI
**Versión:** 2025-11-06  
**Propósito:** Documento de contexto técnico-operativo para CODEX y equipo de desarrollo.  

---

## 🧭 Resumen General
Duración estimada total: **17 a 24 semanas (≈4 a 5½ meses)**  
Desde el inicio del MVS hasta la versión institucional RD‑AMI lista para operación comercial.

---

## 📆 Fases y Tiempos

| Fase | Duración estimada | Semanas | Objetivo principal | Estado financiero |
|------|--------------------|----------|--------------------|------------------|
| **FASE 0 – MVS (Minimum Viable System)** | 3–4 semanas | 1 → 4 | Construir y demostrar un flujo completo (1 expediente procesado de inicio a fin). | Se requiere **40% anticipo ($64,400)** antes del inicio. |
| **FASE 1 – Piloto Operativo** | 6–8 semanas | 5 → 12 | Procesar 10 expedientes reales, validar flujo clínico, ajustar semáforos y panel médico. | VCORP **absorbe costos**; sin mantenimiento mensual. |
| **FASE 2 – Consolidación Institucional** | 8–12 semanas | 12 → 24 | Integrar ECG, Campimetría y Toxicológico; roles, dashboard y estabilidad operativa. | **30% segundo pago ($48,300)** + inicio mantenimiento **$10,000 + IVA/mes**. |
| **FASE 3 – Producción Estable / Comercialización** | Continua | 24 → ∞ | Despliegue institucional, SLA activo, mejoras evolutivas y soporte comercial. | **30% final ($48,300)** + mantenimiento mensual recurrente. |

---

## 🎯 Objetivos y Entregables por Fase

### **FASE 0 – MVS**
- Subida manual de PDFs (1 expediente completo)  
- Extracción de datos (Lab, RX, Audiometría, Espirometría)  
- Generación de reporte con QR y folio  
- Validación médica visual  
**Resultado:** Demostración funcional del concepto RD‑AMI.

### **FASE 1 – Piloto Operativo**
- Ingesta automatizada (carpeta / SFTP)  
- Motor de parsing y normalización  
- Semáforos y panel médico de validación  
- Emisión de PDF institucional  
**Resultado:** 10 expedientes reales validados médicamente.

### **FASE 2 – Consolidación Institucional**
- Integración de nuevos estudios (ECG, Campimetría, Toxicológico)  
- Roles por sede / cliente  
- Dashboard de métricas y trazabilidad  
- Documentación técnica y médica  
**Resultado:** Versión institucional RD‑AMI v1.0 estable.

### **FASE 3 – Producción Estable / Comercialización**
- SLA y monitoreo continuo  
- Mantenimiento mensual ($10,000 + IVA)  
- Soporte a clientes y mejoras evolutivas  
**Resultado:** Operación comercial RD‑AMI lista para escalar.

---

## ⚙️ Notas para CODEX
- Este cronograma debe servir como **mapa de referencia** para el flujo de desarrollo en VS Code.  
- Cada fase puede representarse como **épica o módulo** en el plan de trabajo de CODEX.  
- Los puntos de control coinciden con los hitos financieros y de validación médica.  
