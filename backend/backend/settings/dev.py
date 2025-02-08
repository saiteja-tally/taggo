from .base import *

DEBUG = True  
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '10.96.2.134'] 

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'taggo',
        'USER': 'postgres',
        'PASSWORD': 'pravesh123',
        'HOST': 'tally-ai-doc-ai-taggo-database.c1scke6e0waa.ap-south-1.rds.amazonaws.com',
        'PORT': '5432',  # Set to '3306' by default for MySQL
    }
}

S3_DOC_BUCKET = 'tally-ai-doc-ai-taggo-documents'
SQS_PRE_LABEL_QUEUE_URL = 'https://sqs.ap-south-1.amazonaws.com/381491826341/tally-ai-doc-ai-taggo-pre-label-queue'
S3_LABELLING_BUCKET = 'tally-ai-doc-ai-taggo-labelling'
S3_LABEL_BUCKET = 'tally-ai-doc-ai-taggo-labels'
