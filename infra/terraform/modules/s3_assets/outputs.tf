output "bucket_name"            { value = aws_s3_bucket.assets.id }
output "bucket_arn"             { value = aws_s3_bucket.assets.arn }
output "cloudfront_domain_name" { value = aws_cloudfront_distribution.assets_cdn.domain_name }
