resource_group_name      = "marxan"
storage_account_name     = "marxan"
project_name             = "marxan"
bastion_ssh_public_keys  = [
  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCsQgoIZQAVAMFnESCsYotosbp3N2n8onp8Xmn0DZJmCnBzkfvn2SJdTQRKcyzjcHBqrseq+8Id0JYdb1aJJT2497b7NVOWvVLgqD5pYoxwLO4m3VjppUjpOfgGk3aBpzQTGwPHMqk4X4yvHNAuQcCTxo6gNIsyJZFxdzdc2P+oDLdTwekzsQvsPscFDXDYvtLTkCnSfeZAKsbb45XiAsH0HRnwzJYPvPr69V6c1R3igc2aDZ+eI2sZPvsCXWnvJYfL0QLJp+NwqJuRzHygcxsByg9p/wTPko2vEQLGvefBqjMFHbDYRyVh1omfwt3w/l5R6Abb1Mc2sNDqhBKFEe7/"
]
domain                   = "marxan.vizzuality.com"
github_org               = "Vizzuality"
github_repo              = "marxan-cloud"
github_production_branch = "main"
github_staging_branch    = "staging"
key_vault_access_users  = ["tiago.garcia_vizzuality.com#EXT#", "andrea.rota_vizzuality.com#EXT#"]
sparkpost_dns_dkim_name  = ""
sparkpost_dns_dkim_value = ""
project_tags             = {}
key_vault_access_users = []
mapbox_api_token = "pleaseChangeThis"

deploy_production           = true
production_db_instance_size = "GP_Standard_D32ds_v4"
production_db_storage_size = 4194304

staging_db_instance_size = "GP_Standard_D4ds_v4"
staging_db_storage_size = 131072

support_email               = "marxanadmin@tnc.org"
