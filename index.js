const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "https://job-explorer-client.web.app"],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.xoayx36.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobsCollection = client.db("jobsDB").collection("jobs");
    const applicationCollection = client.db("jobsDB").collection("applications");

    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    //To load single job
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // To get user specific data
    app.get("/myJobs", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { userEmail: req.query.email };
      }
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    // To post new job
    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });

    // to update specific job
    app.put("/jobs/:id", async(req, res) => {
      const id = req.params.id;
      const job = req.body;
      const query = {_id: new ObjectId(id)};
      const options = {upsert:  true};
      const updateJob = {
        $set:{
          pictureUrl: job.pictureUrl,
          userName:job.userName,
          companyLogo: job.companyLogo,
          jobTitle: job.jobTitle,
          jobCategory: job.jobCategory,
          salaryRange:job.salaryRange,
          jobDescription: job.jobDescription,
          applicationDeadline: job.applicationDeadline
        }
      };
      const result = await jobsCollection.updateOne(query, updateJob, options);
      res.send(result);
    })

    app.put("/allJobs/:id", async(req, res) => {
      const id = req.params.id;
      const updatedJob = req.body;
      const query = {_id: new ObjectId(id)};
      const updateJob = {
        $set:{
          jobApplicants: updatedJob.updatedApplicants 
        }
      };
      const result = await jobsCollection.updateOne(query, updateJob);
      res.send(result);
    })

    // To delete specific job
    app.delete("/myJobs/:id", async (req, res) => {
      const id  = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    })

    // Manage Applications
    // post applications
    app.post("/applications", async (req, res) => {
      const newApplication = req.body;
      const result = await applicationCollection.insertOne(newApplication);
      res.send(result);
    });

    // to get applied jobs

    app.get('/appliedJobs', async(req, res) => {
      const query = {userEmail: req.query.email}
      const applications = await applicationCollection.find(query).toArray();
      const applicationIds = applications.map(application => new ObjectId(application.jobId));
      const jobsQuery = {_id: {$in: applicationIds}}
      const result = await jobsCollection.find(jobsQuery).toArray();
      res.send(result);
    })


    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Job Explorer Server");
});

app.listen(port, () => {
  console.log("Server is running on the port : ", port);
});
