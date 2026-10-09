output "alb_dns_name"          { value = aws_lb.main.dns_name }
output "backend_tg_arn"        { value = aws_lb_target_group.backend_go.arn }
output "ai_tg_arn"             { value = aws_lb_target_group.ai_engine.arn }
