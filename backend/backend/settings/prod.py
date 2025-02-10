from .base import *

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'taggo',
        'USER': 'postgres',
        'PASSWORD': 'taggo123',
        'HOST': 'tally-ai-doc-ai-taggo-database-prod.c1scke6e0waa.ap-south-1.rds.amazonaws.com',
        'PORT': '5432',  # Set to '3306' by default for MySQL
    }
} 

S3_DOC_BUCKET = 'tally-ai-doc-ai-taggo-documents-prod'
SQS_PRE_LABEL_QUEUE_URL = 'https://sqs.ap-south-1.amazonaws.com/381491826341/tally-ai-doc-ai-taggo-pre-label-queue-prod'
S3_LABELLING_BUCKET = 'tally-ai-doc-ai-taggo-labelling-prod'
S3_LABEL_BUCKET = 'tally-ai-doc-ai-taggo-labels-prod'