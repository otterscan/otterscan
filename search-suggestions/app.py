import sqlite3
import threading

from flask import Flask, jsonify, request

app = Flask(__name__)

# Thread-local SQLite connection object
connection = threading.local()

def get_db():
    db = getattr(connection, 'db', None)
    if db is None:
        # Create a new connection object for this thread
        db = sqlite3.connect('database.db')
        connection.db = db
    return db

@app.route('/api/search/', defaults={'text': None})
@app.route('/api/search/<text>')
def search(text):
    if text is None:
        return jsonify([])
    conn = get_db()
    cursor = conn.cursor()
    query = 'SELECT label, address FROM labels WHERE label LIKE ? LIMIT 25'
    cursor.execute(query, (text + '%',))

    results = [[row[0], row[1]] for row in cursor.fetchall()]
    return jsonify(results)

@app.after_request
def after_request_func(response):
    if request.headers.get('Origin'):
        response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run()
