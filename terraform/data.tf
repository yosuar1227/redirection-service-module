data "archive_file" "redirectUrlLambda" {
  type        = "zip"
  source_file = "${path.module}/../app/dist/${var.redirectUrlLambda}.js"
  output_path = "${path.module}/files/lambda_redirect_url.zip"
}

data "aws_dynamodb_table" "ShortLinkTable" {
  name = "short-link-table"
}


data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "lambda_redirect_url_execution" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem"
    ]
    resources = [
      data.aws_dynamodb_table.ShortLinkTable.arn
    ]
  }
}