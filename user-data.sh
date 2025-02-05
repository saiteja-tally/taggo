#!/bin/bash
# Update the package index

# Change directory to the backend path
cd /home/ec2-user/taggo/backend/

# Run the Django development server using PM2
pm2 start python --name "django-server" -- manage.py runserver 0.0.0.0:5000

# Change directory to the frontend path
cd /home/ec2-user/taggo/frontend/

# Run the npm development server using PM2
pm2 start npm --name "npm-server" -- run dev -- -H 0.0.0.0