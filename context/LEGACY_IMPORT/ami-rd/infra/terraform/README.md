# Terraform — RD-AMI

Infraestructura codificada para el piloto RD-AMI (Integra Evolucionada). Esta carpeta cubre el aprovisionamiento mínimo del entorno GCP/Firebase descrito en el backlog US0.1.

## Recursos incluidos
- Creación/opcional del proyecto GCP (`google_project`) con etiquetas y facturación.
- Habilitación de APIs esenciales (App Engine, Firestore, Storage, Pub/Sub, Run, Secrets).
- App Engine + Firestore en modo **native** (ubicación configurable).
- Bucket de Storage versionado para PDFs/expedientes.
- Topics Pub/Sub (ingesta, extracción, notificaciones y DLQ).
- Cuenta de servicio “rd-ami-orchestrator” con permisos de Storage y Pub/Sub.

## Prerrequisitos
1. Terraform ≥ 1.6.0 (`brew install terraform` o `choco install terraform`).
2. `gcloud auth application-default login` con permisos para crear/administrar recursos.
3. Variables sensibles listas (`ORG_ID`, `BILLING_ACCOUNT`, `PROJECT_ID`) si se va a crear el proyecto.

## Uso
```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # pendiente de completar con tus valores
terraform init
terraform plan
terraform apply
```

### Variables clave (`terraform.tfvars` ejemplo)
```hcl
project_id               = "rd-ami-staging"
project_name             = "RD AMI Staging"
enable_project_creation  = false
region                   = "us-central1"
zone                     = "us-central1-a"
firestore_location       = "us-central"
bucket_location          = "US"
labels = {
  owner     = "rd-ami"
  env       = "staging"
  managedBy = "terraform"
}
```

> Nota: si `enable_project_creation = true`, debes proporcionar también `org_id` y `billing_account`.

## Emuladores locales (relacionado con US0.2)
En paralelo, configuraremos Firebase Local Emulator Suite para desarrollar sin depender de GCP. Ver sección “DevEx” en `README.md` principal para los comandos (`npm run dev:emulators`).

## Próximos pasos
1. Definir `terraform.tfvars` para `staging` y `prod`.
2. Integrar este módulo en el pipeline de CI (GitHub Actions → Terraform Cloud o plan/apply manual con revisión).
3. Extender con módulos de Cloud Run, Cloud Functions y Secrets a medida que avancemos en el backlog.
