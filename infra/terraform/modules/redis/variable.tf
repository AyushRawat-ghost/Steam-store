variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "private_db_subnet_ids" {
  type = list(string)
}

variable "redis_sg_id" {
  type = string
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.small"
}
