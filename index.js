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
const excercizeSchema = new mongoose.Schema({
  _id: String,
  description: String,
  duration: Number,
  date: Date
})
const User = mongoose.model('User', userSchema)
const Excercize = mongoose.model('Excercize', excercizeSchema)

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



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
