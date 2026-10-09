resource "aws_docdb_subnet_group" "docdb" {
  name       = "${var.project_name}-${var.environment}-docdb-subnet"
  subnet_ids = var.private_db_subnet_ids
}

resource "aws_docdb_cluster" "docdb" {
  cluster_identifier      = "${var.project_name}-${var.environment}-docdb"
  engine                  = "docdb"
  master_username         = var.master_username
  master_password         = var.master_password
  db_subnet_group_name    = aws_docdb_subnet_group.docdb.name
  vpc_security_group_ids  = [var.docdb_sg_id]
  skip_final_snapshot     = true
}

resource "aws_docdb_cluster_instance" "instance" {
  count              = 1
  identifier         = "${var.project_name}-${var.environment}-docdb-1"
  cluster_identifier = aws_docdb_cluster.docdb.id
  instance_class     = var.instance_class
}
