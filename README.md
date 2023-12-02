# URL Shortener Microservice

Uses Node.js, JavaScript, and MongoDb.

# Routes

1. `app.post('/api/shorturl')`
Payload:
```
{
    "url": "https://github.com/jamescarranza"
}
```
Response:
```
{
    "original_url": "https://github.com/jamescarranza",
    "short_url": 75640
}
```

2. `app.get('/api/shorturl/:id)`
```
http://localhost:49580/api/shorturl/75640
```
