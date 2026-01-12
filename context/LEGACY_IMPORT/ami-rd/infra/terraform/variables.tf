variable "project_id" {
  description = "ID del proyecto GCP (se crea o reutiliza según la bandera enable_project_creation)."
  type        = string
}

variable "project_name" {
  description = "Nombre visible del proyecto GCP."
  type        = string
}

variable "billing_account" {
  description = "ID de la cuenta de facturación (BILLING_ACCOUNT_ID). Requerido si se crea el proyecto."
  type        = string
  default     = null
}

variable "org_id" {
  description = "ID de la organización (solo si enable_project_creation = true)."
  type        = string
  default     = null
}

variable "enable_project_creation" {
  description = "Si es true, Terraform intentará crear el proyecto. Si es false, se asumirá que ya existe."
  type        = bool
  default     = false
}

variable "region" {
  description = "Región primaria para recursos regionales (Cloud Run, Cloud Functions)."
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zona por defecto para recursos zonales."
  type        = string
  default     = "us-central1-a"
}

variable "firestore_location" {
  description = "Región de Firestore/Datastore. Debe coincidir con la región del App Engine."
  type        = string
  default     = "us-central"
}

variable "bucket_location" {
  description = "Ubicación del bucket de Storage que alojará los PDFs y reportes."
  type        = string
  default     = "US"
}

variable "labels" {
  description = "Etiquetas comunes para todos los recursos (costeo, owner, entorno)."
  type        = map(string)
  default = {
    owner     = "rd-ami"
    managedBy = "terraform"
  }
}

variable "pubsub_topics" {
  description = "Listado de topics Pub/Sub a crear."
  type        = list(string)
  default = [
    "rd-ami-ingestion",
    "rd-ami-extraction",
    "rd-ami-notifications",
    "rd-ami-dlq"
  ]
}
