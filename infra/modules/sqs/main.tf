resource "aws_sqs_queue" "resume_updates" {
  name                        = "devresume-${var.environment}-resume-updates.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 300
  message_retention_seconds   = 86400  # 1 day
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.resume_updates_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Environment = var.environment
    Service     = "resume-processing"
  }
}

resource "aws_sqs_queue" "resume_updates_dlq" {
  name                      = "devresume-${var.environment}-resume-updates-dlq.fifo"
  fifo_queue               = true
  message_retention_seconds = 1209600  # 14 days

  tags = {
    Environment = var.environment
    Service     = "resume-processing-dlq"
  }
}

resource "aws_sqs_queue" "pdf_generation" {
  name                      = "devresume-${var.environment}-pdf-generation"
  visibility_timeout_seconds = 600
  message_retention_seconds = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.pdf_generation_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Environment = var.environment
    Service     = "pdf-generation"
  }
}

resource "aws_sqs_queue" "pdf_generation_dlq" {
  name                      = "devresume-${var.environment}-pdf-generation-dlq"
  message_retention_seconds = 1209600  # 14 days

  tags = {
    Environment = var.environment
    Service     = "pdf-generation-dlq"
  }
}

resource "aws_sqs_queue" "notifications" {
  name                      = "devresume-${var.environment}-notifications"
  visibility_timeout_seconds = 300
  message_retention_seconds = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notifications_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Environment = var.environment
    Service     = "notifications"
  }
}

resource "aws_sqs_queue" "notifications_dlq" {
  name                      = "devresume-${var.environment}-notifications-dlq"
  message_retention_seconds = 1209600  # 14 days

  tags = {
    Environment = var.environment
    Service     = "notifications-dlq"
  }
}

# IAM Role for SQS Workers
resource "aws_iam_role" "sqs_worker_role" {
  name = "devresume-${var.environment}-sqs-worker-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = var.eks_oidc_provider_arn
        }
        Condition = {
          StringEquals = {
            "${var.eks_oidc_provider}:sub": "system:serviceaccount:${var.environment}:sqs-worker-sa"
          }
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Service     = "sqs-worker"
  }
}

# IAM Policy for SQS access
resource "aws_iam_role_policy" "sqs_worker_policy" {
  name = "devresume-${var.environment}-sqs-worker-policy"
  role = aws_iam_role.sqs_worker_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = [
          aws_sqs_queue.resume_updates.arn,
          aws_sqs_queue.pdf_generation.arn,
          aws_sqs_queue.notifications.arn
        ]
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "queue_depth_alarm" {
  for_each = {
    resume_updates = aws_sqs_queue.resume_updates
    pdf_generation = aws_sqs_queue.pdf_generation
    notifications = aws_sqs_queue.notifications
  }

  alarm_name          = "devresume-${var.environment}-${each.key}-depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "ApproximateNumberOfMessagesVisible"
  namespace          = "AWS/SQS"
  period             = "300"
  statistic          = "Average"
  threshold          = "1000"
  alarm_description  = "Queue depth exceeds threshold"
  alarm_actions      = [var.sns_topic_arn]

  dimensions = {
    QueueName = each.value.name
  }

  tags = {
    Environment = var.environment
    Service     = each.key
  }
}

# Outputs
output "queue_urls" {
  value = {
    resume_updates = aws_sqs_queue.resume_updates.url
    pdf_generation = aws_sqs_queue.pdf_generation.url
    notifications  = aws_sqs_queue.notifications.url
  }
}

output "queue_arns" {
  value = {
    resume_updates = aws_sqs_queue.resume_updates.arn
    pdf_generation = aws_sqs_queue.pdf_generation.arn
    notifications  = aws_sqs_queue.notifications.arn
  }
}

output "worker_role_arn" {
  value = aws_iam_role.sqs_worker_role.arn
} 