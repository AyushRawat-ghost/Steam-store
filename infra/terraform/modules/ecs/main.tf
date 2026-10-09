# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "go" {
  name              = "/ecs/${var.project_name}-backend-go"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "ai" {
  name              = "/ecs/${var.project_name}-ai-engine"
  retention_in_days = 14
}

# IAM Execution Role
resource "aws_iam_role" "ecs_execution" {
  name = "${var.project_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_exec_policy" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task Definition: Go Backend
resource "aws_ecs_task_definition" "backend_go" {
  family                   = "${var.project_name}-backend-go"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([{
    name      = "backend-go"
    image     = "${var.ecr_backend_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 8080
      hostPort      = 8080
    }]
    environment = [
      { name = "PORT", value = "8080" },
      { name = "DATABASE_URL", value = "postgres://${var.db_username}:${var.db_password}@${var.db_endpoint}/${var.db_name}" },
      { name = "REDIS_ADDR", value = "${var.redis_endpoint}:6379" },
      { name = "MONGO_URI", value = "mongodb://${var.docdb_username}:${var.docdb_password}@${var.docdb_endpoint}:27017" },
      { name = "S3_BUCKET_NAME", value = var.s3_bucket_name },
      { name = "JWT_SECRET", value = var.jwt_secret }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.go.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])
}

# Task Definition: Python AI Engine
resource "aws_ecs_task_definition" "ai_engine" {
  family                   = "${var.project_name}-ai-engine"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([{
    name      = "ai-engine"
    image     = "${var.ecr_ai_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
    }]
    environment = [
      { name = "PORT", value = "8000" },
      { name = "GEMINI_API_KEY", value = var.gemini_api_key },
      { name = "REDIS_ADDR", value = "${var.redis_endpoint}:6379" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ai.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ai"
      }
    }
  }])
}

# ECS Fargate Service: Go Backend
resource "aws_ecs_service" "backend_go" {
  name            = "${var.project_name}-go-svc"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend_go.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_app_subnet_ids
    security_groups = [var.ecs_sg_id]
  }

  load_balancer {
    target_group_arn = var.backend_tg_arn
    container_name   = "backend-go"
    container_port   = 8080
  }
}

# ECS Fargate Service: Python AI Engine
resource "aws_ecs_service" "ai_engine" {
  name            = "${var.project_name}-ai-svc"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ai_engine.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_app_subnet_ids
    security_groups = [var.ecs_sg_id]
  }

  load_balancer {
    target_group_arn = var.ai_tg_arn
    container_name   = "ai-engine"
    container_port   = 8000
  }
}
