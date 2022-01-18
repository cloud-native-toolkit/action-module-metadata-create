output "id" {
  value       = var.server_url
  description = "ID of the cluster."
  depends_on  = [null_resource.oc_login]
}
