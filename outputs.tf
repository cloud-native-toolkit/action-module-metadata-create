output "id" {
  value       = var.server_url
  description = "ID of the cluster."
  depends_on  = [null_resource.oc_login]
}

output "name" {
  value       = "cluster"
  description = "Name of the cluster"
  depends_on  = [null_resource.oc_login]
}

output "region" {
  value       = ""
  description = "Region of the cluster"
  depends_on  = [null_resource.oc_login]
}

output "resource_group_name" {
  value       = ""
  description = "Resource group of the cluster"
  depends_on  = [null_resource.oc_login]
}

output "server_url" {
  value       = var.server_url
  description = "The url of the control server."
  depends_on  = [null_resource.oc_login]
}

output "config_file_path" {
  value       = local.cluster_config
  description = "Path to the config file for the cluster."
  depends_on  = [null_resource.oc_login]
}

output "platform" {
  value = {
    kubeconfig = local.cluster_config
    type       = "openshift"
    type_code  = "ocp4"
    version    = var.cluster_version
    ingress    = var.ingress_subdomain
    tls_secret = var.tls_secret_name
  }
  description = "Configuration values for the cluster platform"
  depends_on  = [null_resource.oc_login]
}
