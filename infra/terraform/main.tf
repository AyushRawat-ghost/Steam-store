module "vpc" {
  source             = "./modules/vpc"
  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

module "security" {
  source       = "./modules/security"
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

module "s3_assets" {
  source       = "./modules/s3_assets"
  project_name = var.project_name
  environment  = var.environment
}

module "database" {
  source                = "./modules/database"
  project_name          = var.project_name
  environment           = var.environment
  private_db_subnet_ids = module.vpc.private_db_subnet_ids
  rds_sg_id             = module.security.rds_sg_id
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
  db_instance_class     = var.db_instance_class
}

module "redis" {
  source                = "./modules/redis"
  project_name          = var.project_name
  environment           = var.environment
  private_db_subnet_ids = module.vpc.private_db_subnet_ids
  redis_sg_id           = module.security.redis_sg_id
  redis_node_type       = var.redis_node_type
}

module "documentdb" {
  source                = "./modules/documentdb"
  project_name          = var.project_name
  environment           = var.environment
  private_db_subnet_ids = module.vpc.private_db_subnet_ids
  docdb_sg_id           = module.security.docdb_sg_id
  master_username       = var.docdb_master_username
  master_password       = var.docdb_master_password
  instance_class        = var.docdb_instance_class
}

module "alb" {
  source            = "./modules/alb"
  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
}

module "ecs" {
  source                 = "./modules/ecs"
  aws_region             = var.aws_region
  project_name           = var.project_name
  environment            = var.environment
  private_app_subnet_ids = module.vpc.private_app_subnet_ids
  ecs_sg_id              = module.security.ecs_sg_id
  backend_tg_arn         = module.alb.backend_tg_arn
  ai_tg_arn              = module.alb.ai_tg_arn
  ecr_backend_url        = "123456789012.dkr.ecr.us-east-1.amazonaws.com/steam-backend-go"
  ecr_ai_url             = "123456789012.dkr.ecr.us-east-1.amazonaws.com/steam-ai-engine"
  db_endpoint            = module.database.endpoint
  db_name                = var.db_name
  db_username            = var.db_username
  db_password            = var.db_password
  redis_endpoint         = module.redis.primary_endpoint_address
  docdb_endpoint         = module.documentdb.endpoint
  docdb_username         = var.docdb_master_username
  docdb_password         = var.docdb_master_password
  s3_bucket_name         = module.s3_assets.bucket_name
  jwt_secret             = var.jwt_secret
  gemini_api_key         = var.gemini_api_key
}
