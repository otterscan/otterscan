# Address label search suggestions
Create and run your own address label search server

1. Install dependencies
```
pip install -r requirements.txt
```

2. Create address label database
```
python ./setup.py ../src/api/address-resolver/hardcoded-addresses/1.json
```

3. Run server
```
flask run -p 5176
```
