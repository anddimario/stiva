Manage contents on AWS Lambda 

### Requirements
- nodejs > 8
- [serverless](https://serverless.com/) > 1

### Run on localhost
```
npm i
export AWS_REGION='localhost'
export TOKEN_SECRET='testlocalhost'
export DYNAMO_ENDPOINT='{"endpoint":"http://localhost:8000"}'
sls offline start
```

### Create an admin
- `node scripts/superUser ADMIN_EMAIL ADMIN_PASSWORD`    
**NOTE** You need env variables, based on region

### Curl examples
- login 
```
curl --data '{"email":"admin@example.com","password":"password"}' -H "Content-Type: application/json" http://localhost:3000/login
```
- add user (admin)
```
curl -H "Authorization: Bearer MY_TOKEN" --data '{"type":"add","email":"test@example.com","userRole":"user"}' -H "Content-Type: application/json" http://localhost:3000/users
```
- delete user (admin)
```
curl -H "Authorization: Bearer MY_TOKEN" "http://localhost:3000/users?type=delete&email=test@example.com"
```
- users list (admin)
```
curl -H "Authorization: Bearer MY_TOKEN" "http://localhost:3000/users?type=list"
```
- user info (admin)
```
curl -H "Authorization: Bearer MY_TOKEN" "http://localhost:3000/users?email=test@example.com&type=get"
```
- user info (owner)
```
curl -H "Authorization: Bearer MY_TOKEN" "http://localhost:3000/users?type=me"
```

### Todo
- contents (add, remove, etc)
- docs (deploy etc)
- tests
- registration
- password recovery
- validate registration