#!/bin/bash
# Change directory to the backend path
cd /home/ec2-user/taggo/backend/

# Check if the environment variable is passed, else default to dev
if [ "$1" == "prod" ]; then
    ENV="prod"
else
    ENV="dev"
fi

# Run the Django development server using PM2 with the correct settings
pm2 start python --name "django-server" -- manage.py runserver 0.0.0.0:5000 --settings=backend.settings.$ENV

# Change directory to the frontend path
cd /home/ec2-user/taggo/frontend/

# Run the npm development server using PM2
pm2 start npm --name "npm-server" -- run dev -- -H 0.0.0.0
