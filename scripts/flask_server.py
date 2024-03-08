#!/usr/bin/env python3
from flask import Flask, send_from_directory, send_file
from werkzeug.exceptions import NotFound, Forbidden
import pathlib

app = Flask(__name__)
dist_folder = pathlib.Path('../dist')

@app.route('/')
def show_index():
    return send_file(dist_folder / 'index.html', mimetype='text/html', max_age=3600*24)

@app.route('/<path:subpath>')
def show_path(subpath):
    try:
        return send_from_directory(dist_folder, subpath, max_age=3600*24*3)
    except (NotFound, Forbidden) as e:
        return show_index()

if __name__ == "__main__":
    app.run()
