locals {
  namespace       = "onghub-${var.env}"
  domain          = "onghub.ro"
  frontend_domain = var.env == "production" ? "app.${local.domain}" : "app-${var.env}.${local.domain}"
  backend_domain  = var.env == "production" ? "api.${local.domain}" : "api-${var.env}.${local.domain}"
  mail_domain     = "onghub.ro"

  image = {
    repo = data.aws_ecr_repository.ecr.repository_url
    tag  = "develop"
  }

  centrucivic = {
    namespace       = "centrucivic-${var.env}"
    frontend_domain = var.env == "production" ? "centrucivic.onghub.ro" : "centrucivic-${var.env}.onghub.ro"
  }

  practice4good = {
    namespace       = "practice4good-${var.env}"
    frontend_domain = var.env == "production" ? "practice4good.onghub.ro" : "practice4good-${var.env}.onghub.ro"
  }

  teo = {
    namespace       = "teo-${var.env}"
    frontend_domain = "teo-development.onghub.ro"
    # frontend_domain = var.env == "production" ? "teo.onghub.ro" : "teo-${var.env}.onghub.ro"
  }

  vpc = {
    cidr_block = "10.0.0.0/16"
    public_subnets = [
      "10.0.1.0/24",
      "10.0.2.0/24",
      "10.0.3.0/24"
    ]
    private_subnets = [
      "10.0.4.0/24",
      "10.0.5.0/24",
      "10.0.6.0/24"
    ]
  }
}
