const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors=require('cors');
const dotenv = require('dotenv').config();
const md5 = require('md5');

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({limit:"10000kb",extended:true}));
app.use(bodyParser.json({limit:"10000kb",extended:true}));

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.nl88l.mongodb.net/ecommerceDB?retryWrites=true&w=majority`)
.catch((err) => {
    console.log(err);
})

const entrySchema = new mongoose.Schema({
  userId : Number,
  itemId : Number,
  title : String,
  description : String,
  createdOn : String,
  category : String,
  points : Number,
  priority : String,
  files : Object
});
const Entry = mongoose.model("Entry", entrySchema);

const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    devices : Object,
    userId : String
  });
  const User = mongoose.model("User", userSchema);

app.get("/", (req,res) => {
    res.send("backend of to do list app")
})

app.post("/login", (req,res) => {
    const username = req.body.username
    const password = req.body.password
    User.find({username:username}, (err,users) => {
        if(users.length>0){
            if(users[0].password===md5(password)){
                res.json(users)
            } else {
                res.json("incorrect password")
            }
        } else {
            res.json("incorrect username")
        }
    })
})

const generateID = (u) => {
    let result = ''+ Date.now()
    result += u.charCodeAt(0)
    return Number(result.slice(5))
}

app.post("/register", (req,res) => {
    const username = req.body.username
    const password = md5(req.body.password)
    const device = req.body.device
    const newUser = new User ({
        username: username,
        password: password,
        device: [device],
        userId : generateID(username)
    })

    newUser.save((err) => {
        if(err) {
            console.log(err);
        } else {
            res.json(generateID(username))
        }
    })
})






app.listen(process.env.PORT || 5000, () => {
    console.log("server started on 5000");
})