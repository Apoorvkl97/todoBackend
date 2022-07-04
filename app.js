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

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.nl88l.mongodb.net/todolistDB?retryWrites=true&w=majority`)
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
    userId : Number
  });
  const User = mongoose.model("User", userSchema);

const deviceSchema = new mongoose.Schema({
    device : String,
    userId : Number
  });
  const Device = mongoose.model("Device", deviceSchema);

app.get("/", (req,res) => {
    res.send("backend of to do list app")
})

app.post("/login", (req,res) => {
    const username = req.body.username
    const password = req.body.password
    User.find({username:username}, (err,users) => {
        if(users.length>0){
            if(users[0].password===md5(password)){
                res.json(users[0].userId)
            } else {
                res.json("incorrect password")
            }
        } else {
            res.json("incorrect username")
        }
    })
})
//check for device
app.post("/device", (req,res) => {
    const device = req.body.device
    Device.find({device:device}, (err,users) => {
        if(users.length>0){
            res.json(users[0].userId)
        } else {
            res.json(false)
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
    const device = (req.body.device?req.body.device:null)
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
//add entry
app.post("/entry", (req,res) => {
  const {userId, itemId, title, decsription, createdOn, category, points, priority, files} = req.body
  const newEntry = new Entry ({userId, itemId, title, decsription, createdOn, category, points, priority, files})

  newEntry.save((err) => {
    if(err) {
        console.log(err);
    } else {
        res.json(true)
    }
  })
})
//read an entry
app.post("/entry/:itemId", (req, res) => {
    const itemId = req.params.itemId
    Entry.find({itemId:itemId}, (err,items) => {
        if(items.length>0){
            res.json(items[0])
        } else {
            res.json(false)
        }
    })
})
//update entry: body contains key value pairs of fields to be updated
app.post("/entry/:itemId/update", (req,res) => {
    const itemId = req.params.itemId
    const data = req.body
    Entry.updateOne({itemId:itemId}, data, (err) => {
        if(err){
            res.json(true)
        } else {
            res.json(false)
        }
    })
})

app.post("/entry/:itemId/delete", (req,res) => {
    const itemId = req.params.itemId
    Entry.deleteOne({itemId:itemId},(err) => {
        if(err){
            res.json(false)
        } else {
            res.json(true)
        }
    })
})
//read all entries of a user
app.post("/entries", (req,res) => {
    const userId = req.body.userId
    Entry.find({userId:userId}, (err,items) => {
        if(err){
            console.log(err);
        } else {
            res.json(items)
        }
    })
})


app.listen(process.env.PORT || 5000, () => {
    console.log("server started on 5000");
})