locals {
  effective_project_id = var.project_id
}

resource "google_project" "rd_project" {
  count           = var.enable_project_creation ? 1 : 0
  name            = var.project_name
  project_id      = var.project_id
  org_id          = var.org_id
  billing_account = var.billing_account
  labels          = var.labels
}

resource "google_project_service" "essential_services" {
  for_each = toset([
    "appengine.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "firestore.googleapis.com",
    "iam.googleapis.com",
    "pubsub.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "storage.googleapis.com"
  ])

  project = local.effective_project_id
  service = each.value

  disable_on_destroy = false
}

resource "google_app_engine_application" "app" {
  project     = local.effective_project_id
  location_id = var.firestore_location
}

resource "google_firestore_database" "default" {
  provider    = google-beta
  project     = local.effective_project_id
  name        = "(default)"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"
}

resource "random_id" "storage_suffix" {
  byte_length = 4
}

resource "google_storage_bucket" "pdfs" {
  name                        = "${var.project_id}-rd-ami-${random_id.storage_suffix.hex}"
  location                    = var.bucket_location
  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 365
    }
  }

  labels = merge(var.labels, { tier = "storage" })
}

resource "google_pubsub_topic" "topics" {
  for_each = toset(var.pubsub_topics)

  name   = each.value
  labels = merge(var.labels, { tier = "events" })
}

resource "google_service_account" "orchestrator" {
  account_id   = "rd-ami-orchestrator"
  display_name = "Orchestrator RD-AMI (Cloud Run/Functions)"
}

resource "google_project_iam_member" "pubsub_publisher" {
  project = local.effective_project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.orchestrator.email}"
}

resource "google_project_iam_member" "storage_admin" {
  project = local.effective_project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.orchestrator.email}"
}
