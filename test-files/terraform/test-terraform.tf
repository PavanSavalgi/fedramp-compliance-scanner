# Comprehensive AWS Infrastructure for FedRAMP Compliance
# This file demonstrates various AWS services with cost estimation capabilities

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "fedramp-vpc"
    Environment = "production"
    Compliance  = "FedRAMP-Moderate"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "fedramp-igw"
  }
}

resource "aws_subnet" "public" {
  count = 2

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "fedramp-public-subnet-${count.index + 1}"
    Type = "public"
  }
}

resource "aws_subnet" "private" {
  count = 2

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "fedramp-private-subnet-${count.index + 1}"
    Type = "private"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "fedramp-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# NAT Gateway for private subnets
resource "aws_eip" "nat" {
  domain = "vpc"
  
  tags = {
    Name = "fedramp-nat-eip"
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "fedramp-nat-gateway"
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "fedramp-private-rt"
  }
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# Security Groups
resource "aws_security_group" "web" {
  name_prefix = "fedramp-web-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fedramp-web-sg"
  }
}

resource "aws_security_group" "database" {
  name_prefix = "fedramp-db-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL/Aurora"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fedramp-db-sg"
  }
}

# IAM Roles and Policies
resource "aws_iam_role" "ec2_role" {
  name = "fedramp-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "fedramp-ec2-role"
  }
}

resource "aws_iam_role_policy" "ec2_policy" {
  name = "fedramp-ec2-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.app_data.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "logs:PutLogEvents",
          "logs:CreateLogGroup",
          "logs:CreateLogStream"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "fedramp-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# KMS Key for Encryption
resource "aws_kms_key" "main" {
  description             = "FedRAMP encryption key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })

  tags = {
    Name = "fedramp-kms-key"
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/fedramp-key"
  target_key_id = aws_kms_key.main.key_id
}

data "aws_caller_identity" "current" {}

# S3 Buckets
resource "aws_s3_bucket" "app_data" {
  bucket = "fedramp-app-data-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "fedramp-app-data"
    Environment = "production"
    Compliance  = "FedRAMP-Moderate"
  }
}

resource "aws_s3_bucket" "logs" {
  bucket = "fedramp-logs-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "fedramp-logs"
    Environment = "production"
    Compliance  = "FedRAMP-Moderate"
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_encryption" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.main.arn
        sse_algorithm     = "aws:kms"
      }
      bucket_key_enabled = true
    }
  }
}

resource "aws_s3_bucket_encryption" "logs" {
  bucket = aws_s3_bucket.logs.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.main.arn
        sse_algorithm     = "aws:kms"
      }
      bucket_key_enabled = true
    }
  }
}

resource "aws_s3_bucket_versioning" "app_data" {
  bucket = aws_s3_bucket.app_data.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_logging" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "access-logs/"
}

resource "aws_s3_bucket_public_access_block" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# EC2 Instances
resource "aws_instance" "web" {
  count = 2

  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.public[count.index].id
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = aws_key_pair.main.key_name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    encrypted             = true
    kms_key_id           = aws_kms_key.main.arn
    delete_on_termination = true
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl start httpd
    systemctl enable httpd
    echo "<h1>FedRAMP Web Server ${count.index + 1}</h1>" > /var/www/html/index.html
  EOF
  )

  tags = {
    Name        = "fedramp-web-${count.index + 1}"
    Environment = "production"
    Compliance  = "FedRAMP-Moderate"
  }
}

resource "aws_key_pair" "main" {
  key_name   = "fedramp-key"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC[EXAMPLE_PUBLIC_KEY]..." # Replace with your actual public key
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "fedramp-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = true

  access_logs {
    bucket  = aws_s3_bucket.logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }

  tags = {
    Name        = "fedramp-alb"
    Environment = "production"
  }
}

resource "aws_lb_target_group" "web" {
  name     = "fedramp-web-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "fedramp-web-tg"
  }
}

resource "aws_lb_target_group_attachment" "web" {
  count = length(aws_instance.web)

  target_group_arn = aws_lb_target_group.web.arn
  target_id        = aws_instance.web[count.index].id
  port             = 80
}

resource "aws_lb_listener" "web" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# RDS Database
resource "aws_db_subnet_group" "main" {
  name       = "fedramp-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "fedramp-db-subnet-group"
  }
}

resource "aws_db_parameter_group" "main" {
  family = "mysql8.0"
  name   = "fedramp-db-params"

  parameter {
    name  = "innodb_file_per_table"
    value = "1"
  }

  tags = {
    Name = "fedramp-db-params"
  }
}

resource "aws_db_instance" "main" {
  identifier = "fedramp-database"

  engine              = "mysql"
  engine_version      = "8.0"
  instance_class      = "db.t3.medium"
  allocated_storage   = 100
  max_allocated_storage = 1000
  storage_type        = "gp3"
  storage_encrypted   = true
  kms_key_id         = aws_kms_key.main.arn

  db_name  = "fedrampdb"
  username = "admin"
  password = "ChangeMe123!" # Use AWS Secrets Manager in production

  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn

  enabled_cloudwatch_logs_exports = ["error", "general", "slow_query"]

  tags = {
    Name        = "fedramp-database"
    Environment = "production"
    Compliance  = "FedRAMP-Moderate"
  }
}

resource "aws_iam_role" "rds_monitoring" {
  name = "fedramp-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/application/fedramp"
  retention_in_days = 90
  kms_key_id       = aws_kms_key.main.arn

  tags = {
    Name        = "fedramp-app-logs"
    Environment = "production"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "main" {
  name       = "fedramp-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "redis" {
  name_prefix = "fedramp-redis-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fedramp-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "fedramp-redis"
  description                = "FedRAMP Redis cluster"

  port                = 6379
  parameter_group_name = "default.redis7"
  node_type           = "cache.t3.micro"
  num_cache_clusters  = 2

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                = aws_kms_key.main.arn

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  tags = {
    Name        = "fedramp-redis"
    Environment = "production"
  }
}

resource "aws_cloudwatch_log_group" "redis_slow" {
  name              = "/aws/elasticache/fedramp-redis/slow-log"
  retention_in_days = 30
  kms_key_id       = aws_kms_key.main.arn
}

# Outputs for cost estimation
output "infrastructure_summary" {
  description = "Summary of deployed infrastructure for cost estimation"
  value = {
    region = "us-east-1"
    vpc = {
      vpc_id = aws_vpc.main.id
      cidr   = aws_vpc.main.cidr_block
    }
    compute = {
      ec2_instances = {
        count         = length(aws_instance.web)
        instance_type = "t3.medium"
        storage_size  = "20GB each"
        storage_type  = "gp3"
      }
      load_balancer = {
        type = "application"
        name = aws_lb.main.name
      }
    }
    storage = {
      s3_buckets = {
        app_data = aws_s3_bucket.app_data.bucket
        logs     = aws_s3_bucket.logs.bucket
      }
      rds = {
        engine        = "mysql"
        instance_type = "db.t3.medium"
        storage       = "100GB (auto-scaling to 1TB)"
        storage_type  = "gp3"
      }
    }
    cache = {
      redis = {
        node_type = "cache.t3.micro"
        nodes     = 2
      }
    }
    networking = {
      nat_gateway = 1
      elastic_ip  = 1
    }
    security = {
      kms_key         = 1
      security_groups = 3
      iam_roles       = 2
    }
  }
}

# Cost estimation tags for all resources
locals {
  common_tags = {
    Project     = "FedRAMP-Compliance"
    Environment = "Production"
    CostCenter  = "Security"
    Owner       = "Infrastructure-Team"
  }
}
