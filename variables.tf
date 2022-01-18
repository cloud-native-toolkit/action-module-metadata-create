variable "server_url" {
  type        = string
  description = "The url for the OpenShift api"
}

variable "login_user" {
  type        = string
  description = "Username for login"
  default     = ""
}

variable "login_password" {
  type        = string
  description = "Password for login"
  default     = ""
  sensitive   = true
}

variable "login_token" {
  type        = string
  description = "Token used for authentication"
  sensitive   = true
}

variable "skip" {
  type        = bool
  description = "Flag indicating that the cluster login has already been performed"
  default     = false
}

variable "cluster_version" {
  type        = string
  description = "The version of the cluster (passed through to the output)"
  default     = ""
}

variable "ingress_subdomain" {
  type        = string
  description = "The ingress subdomain of the cluster (passed through to the output)"
  default     = ""
}

variable "tls_secret_name" {
  type        = string
  description = "The name of the secret containing the tls certificates for the ingress subdomain (passed through to the output)"
  default     = ""
}
