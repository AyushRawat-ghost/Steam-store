variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "private_app_subnet_ids" {
  type = list(string)
}

variable "ecs_sg_id" {
  type = string
}

variable "backend_tg_arn" {
  type = string
}

variable "ai_tg_arn" {
  type = string
}

variable "ecr_backend_url" {
  type = string
}

variable "ecr_ai_url" {
  type = string
}

variable "db_endpoint" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "redis_endpoint" {
  type = string
}

variable "docdb_endpoint" {
  type = string
}

variable "docdb_username" {
  type = string
}

variable "docdb_password" {
  type      = string
  sensitive = true
}

variable "s3_bucket_name" {
  type = string
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
