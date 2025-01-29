#!/bin/bash
# Update the package index

# Change directory to the backend path
cd /home/ec2-user/taggo/backend/

# Run the Django development server
python manage.py runserver 0.0.0.0:8000 &

# Change directory to the frontend path
cd /home/ec2-user/taggo/frontend/

# Run the npm development server
npm run dev -- -H 0.0.0.0 &