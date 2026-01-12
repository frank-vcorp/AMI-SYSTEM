# Reglas de Identidad y Reconciliación

- ID Paciente único (preferente origen SIM); si no existe, generar ID AMI y persistir.
- Match probabilístico: Nombre normalizado + Fecha de nacimiento + Sexo + Fecha del estudio + Folio (si aplica).
- Catálogo único de Empresas (clave y nombre canónico).
- Overrides de identidad con bitácora (quién, cuándo, por qué).