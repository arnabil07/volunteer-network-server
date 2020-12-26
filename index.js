const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const ObjectID = require('mongodb').ObjectID;

const app = express()

app.use(bodyParser.json())
app.use(cors());

// const dbUser = process.env.DB_USER;
// const dbpass = process.env.DB_PASS;
// const dbName = process.env.DB_NAME;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.noogs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const port = 5000



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const eventCollection = client.db("volunteer").collection("childSupport");
  const regCollection = client.db("volunteer").collection("registrations");

  app.post('/addEvent', (req, res) => {
    const events = req.body;
    eventCollection.insertMany(events)
      .then(result => {
        console.log(result.insertedCount);
        res.send(result.insertedCount)
      })
  })

  app.post('/register-event', (req, res) => {
    regCollection.insertOne(req.body)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/data', (req, res) => {
    regCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/events', (req, res) => {
    eventCollection.find({})
      .toArray((error, documents) => {
        res.send(documents)
      })
  })

  app.get('/events/:id', (req, res) => {
    console.log(req.params.id)

    eventCollection.find({ _id: ObjectID(req.params.id) })
      .toArray((error, documents) => {
        res.send(documents[0])

      })
  })

  app.delete('/delete/:id', (req, res) => { 
    regCollection.deleteOne({ _id: ObjectID(req.params.id) })
      .then(result => {
        res.status(200).send(result.deletedCount > 0);
      })
  })

});


app.listen(process.env.PORT || port)