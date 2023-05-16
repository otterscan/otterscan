import argparse
import sqlite3
import json

parser = argparse.ArgumentParser(description="Create an address labels database")
parser.add_argument("labels_json", help="json file containing address labels "
    "(e.g. ../src/api/address-resolver/hardcoded-addresses/1.json)")
args = parser.parse_args()

conn = sqlite3.connect('database.db')
cursor = conn.cursor()
cursor.execute('''CREATE TABLE IF NOT EXISTS labels (id INTEGER PRIMARY KEY, label TEXT, address TEXT)''')

# Populate the table from the labels JSON file
with open(args.labels_json, "r") as f:
    labels = json.load(f)
    for address, label in labels.items():
        cursor.execute('''INSERT INTO labels (label, address) VALUES (?, ?)''', (label, address))
    
conn.commit()
conn.close()
