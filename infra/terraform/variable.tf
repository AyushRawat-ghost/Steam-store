variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "project_name" {
  type    = string
  default = "steam-store"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b"]
}

variable "db_name" {
  type    = string
  default = "steamdb"
}

variable "db_username" {
  type    = string
  default = "steamadmin"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.medium"
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.small"
}

variable "docdb_instance_class" {
  type    = string
  default = "db.t4g.medium"
}

variable "docdb_master_username" {
  type    = string
  default = "docdbadmin"
}

variable "docdb_master_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
  default   = ""
}
