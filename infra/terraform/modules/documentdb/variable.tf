variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "private_db_subnet_ids" {
  type = list(string)
}

variable "docdb_sg_id" {
  type = string
}

variable "master_username" {
  type = string
}

variable "master_password" {
  type      = string
  sensitive = true
}

variable "instance_class" {
  type    = string
  default = "db.t4g.medium"
}
