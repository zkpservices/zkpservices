terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

resource "aws_dynamodb_table" "example" {
  name           = "userdata"
  billing_mode   = "PAY_PER_REQUEST" # Use on-demand billing
  hash_key       = "id"
  attribute {
    name = "id"
    type = "S" # Data type is string for the hash key
  }
}