const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7jyxnen.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const serviceCollection = client.db('PestControl').collection('services')
    const serviceAreaCollection = client.db('PestControl').collection('serviceswithArea')
    const serviceAreaEmailCollection = client.db('PestControl').collection('serviceswithAreaandemail')
    const bookingCollection = client.db('PestControl').collection('booking')
    const addServiceCollection = client.db('PestControl').collection('addService')


    // get services
    app.get('/services', async (req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray()
        res.send(result)
    })

    // post(add service) services
    app.post('/services', async (req, res) => {
        const body = req.body;
        const result = await serviceCollection.insertOne(body)
        res.send(result)
    })


    // get services with area
    app.get('/serviceswithArea', async (req, res) => {
      const cursor = serviceAreaCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    })
    //get service are with email
    app.get('/serviceswithAreaandemail', async (req, res) => {
      const cursor = serviceAreaEmailCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    })
       //get service are with email  by id
    app.get('/serviceswithAreaandemail/:id', async (req, res) => {
      const id =req.params.id;
      const query ={_id:id}
      const result = await serviceAreaEmailCollection.findOne(query)
      res.send(result)
    })

    // post booking
    app.post('/bookings', async (req, res) => {
      const addBooking =req.body;
      const result = await bookingCollection.insertOne(addBooking)
      res.send(result)
    })


    // post add Service
    app.post('/addService', async (req, res) => {
      const addService =req.body;
      const result = await addServiceCollection.insertOne(addService)
      res.send(result)
    })

    // get add service
    app.get('/addServices', async (req, res) => {
      const cursor = addServiceCollection.find();
      const result = await cursor.toArray()
      res.send(result)
      })
      // delete add service
      app.delete('/addServices/:id',async (req,res)=>{
        const id=req.params.id;
        const query ={_id : new ObjectId(id)}
        const result = await addServiceCollection.deleteOne(query)
          res.send(result)
          });



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {


  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Pest control server')
})

app.listen(port, () => {
  console.log(`Serving is running listening on port ${port}`)
})