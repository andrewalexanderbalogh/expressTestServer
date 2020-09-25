'use strict';
const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const httpcodes = require('http-status-codes');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const { DateTime } = require('luxon');
const packageJson = require('./../package');


/* View Rendering */
app.engine('html', require('mustache-express')());
app.set('view engine', 'html');
app.set('views', `${__dirname}/resources/views`);


app.use(cors());                                        // Allow all requests through, no pre-flight checks
app.use(bodyParser.urlencoded({ extended: false }));    // Parse application/x-www-form-urlencoded
app.use(bodyParser.json());                             // Parse application/json

/* Logging */
const accessLogStream = fs.createWriteStream(path.resolve(`${__dirname}/../access.log`), {flags: 'a'});
morgan.token('date', (req, res, tz) =>
     DateTime.local().setZone(tz).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
);
morgan.format('myformat', '[:date[America/Toronto]] ":method :url" :status :res[content-length] - :response-time ms');
app.use(morgan('myformat', { stream: accessLogStream }));



/***** The API Endpoints *****/
/* Default Endpoint */
app.get('/',
    (req, res) =>
        res
        .status(httpcodes.OK)
        .render(`welcome.html`, { appName: packageJson.name, homepage: packageJson.homepage})
);


/* DB Call to fetch `departments` table
*  GET http://localhost:8075/departments
*/
app.get('/departments', (req, res) => {
    const mysql = require('mysql').createConnection(require('./../configs').mysql);

    // Send the query
    mysql.query(`
            SELECT *
            FROM departments;
            `,

        (error, results /* fields */) => {
            if (error) {
                res.status(httpcodes.BAD_GATEWAY).send(`Could not perform query: ${error}`);
            }
            else {
                res.status(httpcodes.OK).send(results);
            }
        }
    );

    // Close the connection when done
    mysql.end(err => {
        if (err) { console.log(err); }
    });
});


/* DB call to fetch a given employee by their employee-number (emp_no)
*  GET http://localhost:8075/employee/emp_no
*/
app.get('/employee/:emp_no', (req, res) => {
    const emp_no = req.params.emp_no;

    const mysql = require('mysql').createConnection(require('./../configs').mysql);
    // Send the query
    mysql.query(`
            SELECT *
            FROM employees
            WHERE employees.emp_no = '${emp_no}';
            `,

        (error, results /* fields */) => {
            if (error) {
                res.status(httpcodes.BAD_GATEWAY).send(`Could not perform query: ${error}`);
            }
            else {
                res.status(httpcodes.OK).send(results);
            }
        }
    );

    // Close the connection when done
    mysql.end(err => {
        if (err) { console.log(err); }
    });
});


/* DB call to fetch employees by gender and hire date
*  GET http://localhost:8075/employees?gender=M&higher_date=2020-01-01
*/
app.get('/employees', (req, res) => {
    const gender = req.query.gender;
    const hire_date = req.query.higher_date;


    const mysql = require('mysql').createConnection(require('./../configs').mysql);
    // Send the query
    mysql.query(`
            SELECT *
            FROM employees
            WHERE employees.gender = '${gender}'
                AND employees.hire_date >= '${hire_date}';
            `,

        (error, results /* fields */) => {
            if (error) {
                res.status(httpcodes.BAD_GATEWAY).send(`Could not perform query: ${error}`);
            }
            else {
                res.status(httpcodes.OK).send(results);
            }
        }
    );

    // Close the connection when done
    mysql.end(err => {
        if (err) { console.log(err); }
    });
});


/* DB call to create new Employee in `employees` table
*  POST http://localhost:8075/employees
*/
app.post('/employees', (req, res) => {
    const emp_no = req.body.emp_no;
    const birth_date = req.body.birth_date;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const gender = req.body.gender;
    const hire_date = req.body.hire_date;


    const mysql = require('mysql').createConnection(require('./../configs').mysql);
    // Send the query
    mysql.query(`
            INSERT INTO employees (
                emp_no, 
                birth_date, 
                first_name, 
                last_name, 
                gender, 
                hire_date
            )
             
            VALUES (
                '${emp_no}', 
                '${birth_date}', 
                '${first_name}', 
                '${last_name}', 
                '${gender}', 
                '${hire_date}'       
            )
            `,

        (error, results /* fields */) => {
            if (error) {
                res.status(httpcodes.BAD_GATEWAY).send(`Could not perform query: ${error}`);
            }
            else {
                res.status(httpcodes.OK).send('Inserted new Employee record');
            }
        }
    );

    // Close the connection when done
    mysql.end(err => {
        if (err) {
            console.log(err);
        }
    });
});


/* Handle non-existing request endpoints */
app.get('*',
    (req, res) =>
        res
        .status(httpcodes.NOT_FOUND)
        .render(`404.html`, { path: req.originalUrl})
);


/*****     *****     *****/


/* Start up the server */
const port = 8075;
require('http')
    .createServer(app)
    .listen(port, () => {
        const startTime = DateTime.local().setZone('America/Toronto').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
        console.log(`${startTime}: Server-Started, listening on Port ${port}`);
    });