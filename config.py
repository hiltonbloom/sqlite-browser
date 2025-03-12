# config.py
import os
from flask import Flask


app = Flask(__name__)
DATABASE = 'C:\\POCs\\pomodoro-app-gpt\\data\\document_embeddings.db' #'pomodoro-app.db'
QUERIES_FILE = os.path.join(app.static_folder, 'queries.json')
