#!/bin/bash
# Update the package index

# Change directory to the backend path
cd /home/ec2-user/taggo/backend/ >> /home/ec2-user/user-data.log 2>&1

# Run the Django development server
python manage.py runserver 0.0.0.0:5000 >> /home/ec2-user/user-data.log 2>&1 &

# Change directory to the frontend path
cd /home/ec2-user/taggo/frontend/ >> /home/ec2-user/user-data.log 2>&1

# Run the npm development server
npm run dev -- -H 0.0.0.0 >> /home/ec2-user/user-data.log 2>&1 &