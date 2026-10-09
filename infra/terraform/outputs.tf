output "alb_dns_endpoint" {
  description = "Public Load Balancer URL for API traffic"
  value       = module.alb.alb_dns_name
}

output "cloudfront_assets_cdn" {
  description = "Global CDN Domain for S3 game banners & videos"
  value       = module.s3_assets.cloudfront_domain_name
}

output "rds_postgres_endpoint" {
  description = "PostgreSQL DB connection endpoint"
  value       = module.database.endpoint
}

output "redis_primary_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.redis.primary_endpoint_address
}

output "documentdb_endpoint" {
  description = "DocumentDB / MongoDB analytics cluster endpoint"
  value       = module.documentdb.endpoint
}
