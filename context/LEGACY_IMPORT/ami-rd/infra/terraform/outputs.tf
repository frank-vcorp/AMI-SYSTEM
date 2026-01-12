output "project_id" {
  description = "Proyecto GCP gestionado para RD-AMI."
  value       = local.effective_project_id
}

output "storage_bucket" {
  description = "Bucket principal donde se almacenan PDFs/expedientes."
  value       = google_storage_bucket.pdfs.name
}

output "pubsub_topics" {
  description = "Topics creados para el pipeline."
  value       = [for topic in google_pubsub_topic.topics : topic.name]
}

output "service_account_email" {
  description = "Cuenta de servicio recomendada para Cloud Run/Functions."
  value       = google_service_account.orchestrator.email
}
