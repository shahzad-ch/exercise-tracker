const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI).catch((err) => console.log(err))
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  log: [{
    description: String,
    duration: Number,
    date: String
  }]
})

let User = new mongoose.model("User", userSchema);
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", async (req, res) => {
  const user = await User.create({
    username: req.body.username
  })
  const obj = {
  username: user.username,
  _id: user._id
  }
  res.json(obj);
})

app.get("/api/users", async (req, res) => {
  const getUsers = await User.find().select({log: 0, __v: 0})
  res.json(getUsers);
})

app.post("/api/users/:_id/exercises", async (req, res) => {
  const description  = req.body.description;
  const duration = parseInt(req.body.duration);
  let date = new Date(req.body.date);
  if(date == "Invalid Date") {
    date = new Date;
  }
  date = date.toDateString();
  let exercise = await User.updateOne({
    _id: req.params._id},
    {
      $push: {log: {
        description: description,
        duration: duration,
        date: date
      }}
    })
    
    const user = await User.findById(req.params._id).select({log: 0, __v: 0});

    const obj = {
      username: user.username,
      description: description,
      duration: duration,
      date: date,
      _id: user._id
    }
    res.json(obj);
})


app.get("/api/users/:_id/logs", async (req, res) => {
  
  
  const user = await User.findById(req.params._id).select({__v: 0, log: { _id: 0}});
  const logLength = user.log.length;
  if(req.query.from || req.query.to || req.query.limit ) {
    const from = new Date (req.query.from);
    const to = new Date(req.query.to);
    if(from != "Invalid Date"){
      user.log = user.log.filter(item => new Date(item.date) > from)
    }
    if(to != "Invalid Date") {
      user.log = user.log.filter(item => new Date(item.date) < to)
    }
    if( req.query.limit) {
      user.log = user.log.slice(0, req.query.limit)
    }
  }
  const obj = {
    username: user.username,
    count: logLength,
    _id: user._id,
    log: user.log
  }
  res.json(obj)
    
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

