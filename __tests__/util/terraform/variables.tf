
variable "login_user" {
  type        = string
  description = "Username for login"
  default     = ""
}

variable "string_var" {
  type        = string
  description = "String variable"
  default     = "test" # comment
  sensitive   = true
}

variable "flag" {
  type        = bool
  description = "Flag value"
  default     = false # comment
}

variable "list_string" {
  type        = list(string)
  description = "List of strings value"
  default     = [
    "test1",
    # comment
    "test2",
    ""
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
  #default = "comment"
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

variable "resource_label" {
  type        = string
  description = "The label for the resource to which the vpe will be connected. Used as a tag and as part of the vpe name."
  default     = "vpn"
}
