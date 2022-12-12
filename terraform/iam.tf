resource "aws_iam_user" "iam_user" {
  name = "${local.namespace}-user"
}

resource "aws_iam_access_key" "iam_user_key" {
  user = aws_iam_user.iam_user.name
}

resource "aws_iam_role" "runner_role" {
  name = "${local.namespace}-apprunner-role"

  assume_role_policy = data.aws_iam_policy_document.runner_role_policy.json
}

resource "aws_iam_role_policy_attachment" "runner_role_ecr_policy_attachment" {
  role       = aws_iam_role.runner_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_iam_role_policy_attachment" "runner_role_cognito_developer_authenticated_policy_attachment" {
  role       = aws_iam_role.runner_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonCognitoDeveloperAuthenticatedIdentities"
}
resource "aws_iam_role_policy_attachment" "runner_role_cognito_power_user_policy_attachment" {
  role       = aws_iam_role.runner_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonCognitoPowerUser"
}

resource "aws_iam_role_policy_attachment" "runner_role_cognito_access_policy_attachment" {
  role       = aws_iam_role.runner_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonESCognitoAccess"
}
resource "aws_iam_role_policy_attachment" "runner_role_s3_policy_attachment" {
  role       = aws_iam_role.runner_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role" "amplify_login_lambda" {
  name               = "${local.namespace}-amplify-login-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_role_policy.json
}

resource "aws_iam_policy" "amplify_backend" {
  name   = "amplify-backend"
  policy = data.aws_iam_policy_document.amplify_login_lambda_policy.json
}

resource "aws_iam_role_policy_attachment" "attach_amplify_login_lambda_policy_to_lambda_role" {
  role       = aws_iam_role.amplify_login_lambda.name
  policy_arn = aws_iam_policy.amplify_backend.arn
}
