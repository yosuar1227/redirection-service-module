//.tf code here
//LAMBDA REDURECT URL
resource "aws_lambda_function" "redirectUrlLambda" {
  filename         = data.archive_file.redirectUrlLambda.output_path
  function_name    = var.redirectUrlLambda
  handler          = "${var.redirectUrlLambda}.handler"
  runtime          = var.defaultRunTime
  timeout          = 900
  memory_size      = 256
  role             = aws_iam_role.redirectUrlLambdaRole.arn
  source_code_hash = data.archive_file.redirectUrlLambda.output_base64sha256

  environment {
    variables = {
      ShortLinkTable : data.aws_dynamodb_table.ShortLinkTable.name
    }
  }

  depends_on = [aws_iam_role_policy_attachment.redirectUrlLambdaAttach, data.archive_file.redirectUrlLambda]
}
//POLICY
resource "aws_iam_role_policy" "redirectUrlLambdaPolicy" {
  name   = "${var.redirectUrlLambda}-policy"
  policy = data.aws_iam_policy_document.lambda_redirect_url_execution.json
  role   = aws_iam_role.redirectUrlLambdaRole.id
}
//ROLE
resource "aws_iam_role" "redirectUrlLambdaRole" {
  name               = "${var.redirectUrlLambda}-execution-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}
//ATTACHMENT
resource "aws_iam_role_policy_attachment" "redirectUrlLambdaAttach" {
  role       = aws_iam_role.redirectUrlLambdaRole.name
  policy_arn = var.defaultPolicyArn
}
//------------GATEWAY FOR REDIRECT URL -----------
resource "aws_api_gateway_rest_api" "redirectUrlGtw" {
  name        = "${var.redirectUrlLambda}RestApi"
  description = "Rest api related for the redirect url lambda"
}
//ROOT PATH -> DYNAMIC VALUE urlCode
resource "aws_api_gateway_resource" "redirectUrlGtwRootResource" {
  rest_api_id = aws_api_gateway_rest_api.redirectUrlGtw.id
  parent_id   = aws_api_gateway_rest_api.redirectUrlGtw.root_resource_id
  path_part   = "{urlCode}"
}
//METHOD
resource "aws_api_gateway_method" "redirectUrlGtwMethod" {
  rest_api_id   = aws_api_gateway_rest_api.redirectUrlGtw.id
  resource_id   = aws_api_gateway_resource.redirectUrlGtwRootResource.id
  http_method   = var.HTTP_METHOD_GET
  authorization = var.NONE_AUTH
}
//CONECT LAMBDA WITH GATEWAY
resource "aws_api_gateway_integration" "lmbGtwredirectUrlIntegration" {
  rest_api_id             = aws_api_gateway_rest_api.redirectUrlGtw.id
  resource_id             = aws_api_gateway_resource.redirectUrlGtwRootResource.id
  http_method             = aws_api_gateway_method.redirectUrlGtwMethod.http_method
  integration_http_method = var.HTTP_METHOD_POST
  type                    = var.AWS_PROXY
  uri                     = aws_lambda_function.redirectUrlLambda.invoke_arn
}
//PERMISSIONS
resource "aws_lambda_permission" "redirectUrlGtwPermissions" {
  statement_id = var.defaultStatementId
  action = var.defaultLambdaAction
  function_name = var.redirectUrlLambda
  principal = var.AMAZON_API_COM
  source_arn = "${aws_api_gateway_rest_api.redirectUrlGtw.execution_arn}/*/${var.HTTP_METHOD_GET}/${aws_api_gateway_resource.redirectUrlGtwRootResource.path_part}"
  depends_on = [ aws_lambda_function.redirectUrlLambda ]
}
//DEPLOY
resource "aws_api_gateway_deployment" "redirectUrlGtwDeploy" {
  rest_api_id = aws_api_gateway_rest_api.redirectUrlGtw.id
  depends_on = [ aws_api_gateway_integration.lmbGtwredirectUrlIntegration, aws_lambda_permission.redirectUrlGtwPermissions ]
}
//STAGE
resource "aws_api_gateway_stage" "redirectUrlGtwStage" {
  deployment_id = aws_api_gateway_deployment.redirectUrlGtwDeploy.id
  rest_api_id = aws_api_gateway_rest_api.redirectUrlGtw.id
  stage_name = var.STAGE
}
//OUTPUT UTL
output "LambdaUrl" {
  value = "${aws_api_gateway_stage.redirectUrlGtwStage.invoke_url}/${aws_api_gateway_resource.redirectUrlGtwRootResource.path_part}"
}
