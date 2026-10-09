resource "aws_db_subnet_group" "rds" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_db_subnet_ids
}

resource "aws_db_parameter_group" "pg16" {
  name   = "${var.project_name}-${var.environment}-pg16-params"
  family = "postgres16"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.project_name}-${var.environment}-db"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = var.db_instance_class
  allocated_storage      = var.allocated_storage
  max_allocated_storage  = 100
  storage_type           = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [var.rds_sg_id]
  parameter_group_name   = aws_db_parameter_group.pg16.name

  multi_az               = var.environment == "production" ? true : false
  skip_final_snapshot    = var.environment == "production" ? false : true
  publicly_accessible    = false
}
