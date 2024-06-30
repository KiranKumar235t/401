const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

let loggedInUser = null;

const users = [
  {
    id: 1,
    username: 'Kiran Kumar',
    email: 'kirankumar@gmail.com',
    password: '1234'
  }
];

const apiUrl = 'https://api.api-ninjas.com/v1/passwordgenerator';
const apiKey = 'WbdFkyvIZCJVWmz8DfMPxw==hHGNrKxEglMJahc7';

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
      return res.render('login', { errorMessage: 'Incorrect email or password' });
    }

    req.session.user = user;
    res.redirect('/passwordGenerator');
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).send('Server Error');
  }
});

app.get('/passwordGenerator', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-api-key': apiKey
      }
    });

    const generatedPassword = response.data.random_password;
    res.render('passwordGenerator', { user: req.session.user, generatedPassword });
  } catch (error) {
    console.error('Password generation error:', error.message);
    res.status(500).send('Password Generation Error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Server Error');
    }
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
