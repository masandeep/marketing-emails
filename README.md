# Project Title

Online clothing mailer service - Sends marketing email to customers about clothing collection.

---
## Requirements

For deployment, you need to have docker installed in your environement & share the drive volume in docker settings.
Note: In production, the application source will be copied to docker using CI tools.

## Install

    $ git clone https://github.com/YOUR_USERNAME/PROJECT_TITLE
    $ cd PROJECT_TITLE

## Configure app

Open `docker-compose.yml` then configure SENDGRID_API_KEY

## Running the project

    $ docker-compose up

## API Doc

Once docker is up, open http://localhost:3000 in browser

## Usage

1. Generate a JWT token using user credentials
    Request:
        URL: 
            http://localhost:3000/api/v1/user/login
        Header:
            application/json: application/json
        Paylod:
            {
                "username": "admin",
                "password": "password"
            }
    Sample Response:
    {
        "success": true,
        "message": "Authentication successful!",
        "token": <token>
    }

2. Send mail request to service using above token & customer information
    Request:
        URL: 
            http://localhost:3000/api/v1/mailer/send
        Header:
            application/json: application/json
            Authorization: Bearer <token>
        Paylod:
            {
                "email": <email>,
                "name": <display name>,
                "saleidentifier": <season> // "Winter"/"Summer/
            }
    Sample Response:
    {
        "success": true,
        "message": "Successfully sent email"
    }