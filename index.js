const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

mongoURI = process.env.MONGO_URI
mongoose.connect(mongoURI)
const userSchema = new mongoose.Schema({
  username: String
})
const exercizeSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
})
const User = mongoose.model('User', userSchema)
const Exercize = mongoose.model('Excercize', exercizeSchema)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req,res)=>{
  User.find()
    .then((founded)=>{res.json(founded)})
    .catch((error)=>{console.error("Error: ", error)})
})

app.post('/api/users', (req,res) =>{
  let username = new User({
    username: req.body.username
  })
  username.save()
    .then((data) => {res.json(data)})
    .catch((error)=>{console.error("Error: ", error)})
})

app.post('/api/users/:_id/exercises', (req, res) => {
  User.findOne({_id: req.params._id}).
    then((user) => {
      if (!user) return res.status(404).json({ error: "User not found" });      
      let exercize = new Exercize({
        user_id: user._id,
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date ? new Date(req.body.date).toDateString() : new Date(Date.now()).toDateString()
      });
      let jsonResponse = {
        _id: user._id,
        username: user.username,
        description: exercize.description,
        duration: exercize.duration,
        date: exercize.date
      }
      return exercize.save()
      .then((exercize) => {res.json(jsonResponse)})
    }).
    catch((err)=>{console.error(err)})
})

app.get('/api/users/:_id/logs', (req,res) =>{
  const { from, to, limit } = req.query
  User.findOne({_id: req.params._id})
    .then((user) => {
      if (!user) return res.status(404).json({ error: "User not found" });    
      Exercize.find({username: user.username})
      .then((exercises)=>{
        if (from) {exercises = exercises.filter((exercise) => new Date(exercise.date) >= new Date(from));}
        if (to) {exercises = exercises.filter((exercise) => new Date(exercise.date) <= new Date(to));}
        if (limit) {exercises = exercises.slice(0, parseInt(limit));}
        let jsonResponse = exercises ? 
          {
            _id: user._id,
            username: user.username,
            count: exercises.length,
            log: exercises
          }
          :{
            _id: user._id,
            username: user.username,
            count: 0,
            log: []
          }  
        res.json(jsonResponse)
      })
    })
    .catch((err)=>{console.error(err)})     
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
