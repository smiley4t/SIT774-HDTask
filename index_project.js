var express = require('express');
var morgan = require('morgan');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt')

let sqlite3 = require('sqlite3').verbose();
// Create the database
let db = new sqlite3.Database('myDB');
//Create table Contact
db.run(`CREATE TABLE IF NOT EXISTS Contact (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT, 
        sirname TEXT,
        email TEXT,
        mobile_number TEXT,
        message TEXT
    )`);
    
//Create table User
db.run(`CREATE TABLE IF NOT EXISTS User (
        Username TEXT,
        Password TEXT
    )`);

    



const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(morgan('common'));
app.use(express.static('public_html'));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // Named pipe
        return val;
    }

    if (port >= 0) {
        // Port number
        return port;
    }

    return false;
}

app.get('/', (req, res, next) => {
    const filePath = path.join(__dirname, 'public_html', 'contact_homeshop.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("Error serving the file: ", err.message);
            res.status(err.status).end();
        }
    });
});

// POST handler to accept contact data
// app.post('/contact', (req, res, next) => {
//     const inputfirstname = req.body.inputFirstname;
//     const inputsirname = req.body.inputSirname;
//     const inputemail = req.body.inputEmail;
//     const inputmobile = req.body.inputMobile;
//     const inputmessage = req.body.message;

//     const stmt = db.prepare(`INSERT INTO Contact (firstname, sirname, email, mobile_number, message) VALUES (?, ?, ?, ?, ?)`);
//     stmt.run([inputfirstname, inputsirname, inputemail, inputmobile, inputmessage], (err) => {
//         if (err) {
//             console.error(err.message);
//             return res.render('error_database');
//         }
//         res.status(200).redirect('/');
//     });
//     stmt.finalize();
// });

// REST endpoint for getting all contact data
// app.get('/contact', function (req, res) {
//     let html = '';

//     // HTML code to display a table populated with the data from the DB
//     html += '<!doctype html><html lang="en">';
//     html += '<head>';
//     html += '<title>Bootstrap Express/SQLite3 Demo</title>';
//     html += '<meta charset="utf-8">';
//     html += '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">';
//     html += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/css/bootstrap.min.css" integrity="sha384-aFq/bzH65dt+w6FI2ooMVUpc+21e0SRygnTpmBvdBgSdnuTN7QbdgL+OapgHtvPp" crossorigin="anonymous">';
//     html += '</head>';

//     html += '<body><div class="container">';
//     html += '<h3> The User Contact and Feedback Table </h3>';
//     html += '<table class="table">';
//     html += '<thead class="thead-dark"><tr>';
//     html += '<th>Firstname</th><th>Sirname</th><th>Email</th><th>Mobile Phone</th><th>Message</th>';
//     html += '</tr></thead><tbody>';

//     // Retrieve data from table Contact
//     db.all('SELECT * FROM Contact', function (err, rows) {
//         if (err) {
//             console.error(err.message);
//             html += '<tr><td colspan="5">Error fetching data</td></tr>';
//         } else if (rows.length === 0) {
//             html += '<tr><td colspan="5">No data found</td></tr>';
//         } else {
//             rows.forEach(function (row) {
//                 html += '<tr>';
//                 html += `<td>${row.firstname}</td>`;
//                 html += `<td>${row.sirname}</td>`;
//                 html += `<td>${row.email}</td>`;
//                 html += `<td>${row.mobile_number}</td>`;
//                 html += `<td>${row.message}</td>`;
//                 html += '</tr>';
//             });
//         }

//         html += '</tbody></table>';
//         html += '</div>';
//         html += '</body></html>';
//         res.send(html);
//     });
// });
//POST handler to accept username and password data

// app.post('/user', (req, res, next) => {
//     const username = req.body.username;
//     const password = req.body.password;
//     const stmt_user = db.prepare(`INSERT INTO User (Username, Password) VALUES (?, ?)`);
//     stmt_user.run([username, password], (err) => {
//         if (err) {
//             console.error(err.message);
//             return res.render('error_database');
//         }
//         res.status(200).redirect('/');
//     });
//     stmt_user.finalize();
// });
app.post('/user', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.get('SELECT * FROM User WHERE Username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).send('Error logging in');
        }
        if (!user) {
            return res.status(400).send('Cannot find user');
        }
        try {
            if (await bcrypt.compare(password, user.Password)) {
                res.send('Success');
            } else {
                res.send('Not Allowed');
            }
        } catch (err) {
            res.status(500).send('Error logging in');
        }
    });
});
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const username = req.body.username;
        
        
        db.run('INSERT INTO User (Username, Password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                return res.status(500).send('Error registering user');
            }
            res.status(201).send('User registered');
        });
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});


// REST endpoint for getting all username and password data
app.get('/user', function (req, res) {
    let html = '';

    // HTML code to display a table populated with the data from the DB
    html += '<!doctype html><html lang="en">';
    html += '<head>';
    html += '<title>Bootstrap Express/SQLite3 Demo</title>';
    html += '<meta charset="utf-8">';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">';
    html += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/css/bootstrap.min.css" integrity="sha384-aFq/bzH65dt+w6FI2ooMVUpc+21e0SRygnTpmBvdBgSdnuTN7QbdgL+OapgHtvPp" crossorigin="anonymous">';
    html += '</head>';

    html += '<body><div class="container">';
    html += '<h3> The User Login Table </h3>';
    html += '<table class="table">';
    html += '<thead class="thead-dark"><tr>';
    html += '<th>Username</th><th>Password</th>';
    html += '</tr></thead><tbody>';

    // Retrieve data from table User
    db.all('SELECT * FROM User', function (err, rows) {
        if (err) {
            console.error(err.message);
            html += '<tr><td colspan="2">Error fetching data</td></tr>';
        } else if (rows.length === 0) {
            html += '<tr><td colspan="2">No data found</td></tr>';
        } else {
            rows.forEach(function (row) {
                html += '<tr>';
                html += `<td>${row.Username}</td>`;
                html += `<td>${row.Password}</td>`;
                html += '</tr>';
            });
        }

        html += '</tbody></table>';
        html += '</div>';
        html += '</body></html>';
        res.send(html);
    });
});

app.listen(port, () => {
    console.log(`Web server running at: http://localhost:${port}`);
    console.log(`Type Ctrl+C to shut down the web server`);
});
