
variable "login_user" {
  type        = string
  description = "Username for login"
  default     = ""
}

variable "string_var" {
  type        = string
  description = "String variable"
  default     = "test"
  sensitive   = true
}

variable "flag" {
  type        = bool
  description = "Flag value"
  default     = false
}

variable "list_string" {
  type        = list(string)
  description = "List of strings value"
  default     = [
    "test1",
    "test2"
  ]
}

variable "no_default" {
  type        = string
}

variable "multi_line_type" {
  type        = object({
    value = string
  })
}

variable "multi_line_type2" {
  type        = object({
    value = object({
      nested_value = string
    })
  })
}

variable "multi_line_type3" {
  type        = list(object({
    value = object({
      nested_value = string
    })
  }))
  default = [{
    value = {
      nested_value = "test"
    }
  }]
}
