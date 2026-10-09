output "cluster_id" {
  value = aws_ecs_cluster.main.id
}

output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "backend_service_name" {
  value = aws_ecs_service.backend_go.name
}

output "ai_service_name" {
  value = aws_ecs_service.ai_engine.name
}
