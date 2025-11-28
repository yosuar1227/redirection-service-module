terraform {
  backend "s3" {
    bucket         = "terraform-state-link-shortener"
    key            = "prod/redirection-service-module/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}