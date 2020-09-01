# expressTestServer
### Node/Express Server Backend for Testing


The API-Server accesses and modifies entries in our __MySQL__ `employees` database

The `employees` database structure is as defined at;
- https://dev.mysql.com/doc/employee/en/employees-introduction.html  
- https://github.com/datacharmer/test_db


### Setup 

First create a `configs.json` file at the root of the project with values that follow 
those given in the `configs.json.example` file.

Then start the API-Server through;
```bash
npm run start
```

This will start the express server at `localhost:8075`