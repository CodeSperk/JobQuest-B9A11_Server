const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors({
  origin: ["http://localhost:5173", "https://job-explorer-client.web.app"],
  credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.xoayx36.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const jobsCollection = client.db('jobsDB').collection('jobs');

    app.get("/jobs", async(req, res) => {
    const result = await jobsCollection.find().toArray();
     res.send(result);
    })

    //To load single job
    app.get("/job/:id", async(req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })

    // To post new job
    app.post("/jobs", async(req, res) => {
      const newJob = req.body;
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Welcome to Job Explorer Server")
});

app.listen(port, () => {
  console.log("Server is running on the port : ", port);
});