const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [{
  username: 'fcc_test',
  _id: 0,
  log: [{
    description: "test",
    duration: 60,
    date: "Fri May 31 2024"
  }]
}];

let count = 1;

app.post("/api/users", (req, res) => {
  const obj = {
    username: req.body.username,
    _id: count++
  }
  users.push(obj);
  
  res.json(obj);
})

app.get("/api/users", (req, res) => {
  const getUsers = users.map( user => ({
    _id: user._id,
    username: user.username
  }))
  res.json(getUsers);
})

app.post("/api/users/:_id/exercises", (req, res) => {
  console.log(req.body);
  const p  = req.body;
  let date = new Date;

  // try {

    const foundUser = users.find(i => i._id == req.params._id);
    let obj = {
      username: foundUser.username,
      description: p.description,
      duration: p.duration,
      date: p.date.toDateString() || date.toDateString(),
      _id: req.params._id
    }
    users.forEach((user) => {
      if (user._id == req.params._id) {
        if (user.log == undefined) {
          user.log = []
        }
          user.log.push({
          description: p.description,
          duration: p.duration,
          date: obj.date
         })
      }
    })

    res.json(obj);
    console.log(obj)
  // }
  // catch (err) {
  //   res.send(err)
  // }
})


app.get("/api/users/:_id/logs", (req, res) => {
  console.log(req.query);
  try {

    const user = users.find(i => i._id == req.params._id);
    const log = {
      username: user.username,
      _id: user._id,
      count: user.log.length,
      log: user.log
    }
    
    res.json(log);
  }
  catch (err) {
    res.json({error: 404});
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

