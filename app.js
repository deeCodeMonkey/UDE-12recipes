const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    mysql = require('mysql'),
    app = express();

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "1234",
    database: "recipe_db"
});

connection.connect();

//Assign Dust engine to .dust files
app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//ROUTE
app.get('/', (req, res) => {
    //mysql connect
    connection.query('SELECT * FROM recipes', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);

        res.render('index', {recipes: results});
    });
});


app.post('/add', (req, res) => {
    var item = {
        name: req.body.name,
        ingredients: req.body.ingredients,
        directions: req.body.directions
    };
    connection.query('INSERT INTO recipes SET ?', item, function (error, results, fields) {
        if (error) throw error;

        res.redirect('/');
    });
});

app.delete('/delete/:id', (req, res) => {
    connection.query('DELETE FROM recipes WHERE recipe_id = ' + req.params.id, function (err, result) {
        if (err) throw err;
        console.log('Deleted' + result.affectedRows + 'rows.');
        console.log('id is ' + req.params.id);
    });
    res.sendStatus(200);
});


//handles submission for edits
app.post('/edit', (req, res) => {
    var item = {
        name: req.body.name,
        ingredients: req.body.ingredients,
        directions: req.body.directions
    };

    connection.query('UPDATE recipes SET ? WHERE recipe_id = ' + req.body.id, item, function (error, results, fields) {
        if (error) throw error;
        res.redirect('/');
    });
});

var PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server started ' + PORT);
});
