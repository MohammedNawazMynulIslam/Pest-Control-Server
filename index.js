const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt =require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors({
  origin:['http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7jyxnen.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// verify middleware
const verify = async(req,res,next)=>{
  const token = req.cookies?.token;
  if(!token){
    res.status(401).send({status:"unAuthorize access"});
    return;
  }
  jwt.verify(token,process.env.SECRET,(error, decode)=>{
    if(error){
      res.status(401).send({status:"Wrong Token"});
    }
    else{
      // console.log(decode)
      req.decode = decode
    }
  });
  next();
};


async function run() {
  try {

    const serviceCollection = client.db('PestControl').collection('services')
    const serviceAreaCollection = client.db('PestControl').collection('serviceswithArea')
    const serviceAreaEmailCollection = client.db('PestControl').collection('serviceswithAreaandemail')
    const bookingCollection = client.db('PestControl').collection('booking')
    const addServiceCollection = client.db('PestControl').collection('addService')

    // user auth



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
    app.get('/serviceswithAreaandemail/:id', verify, async (req, res) => {
      const id =req.params.id;
      const query ={_id:id}
      const result = await serviceAreaEmailCollection.findOne(query)
      res.send(result)
    })

    // post booking
    app.post('/booking', async (req, res) => {
      const addBooking =req.body;
      const result = await bookingCollection.insertOne(addBooking)
      res.send(result)
    })
    // get booking
    app.get('/booking',async(req,res)=>{
     const cursor =  bookingCollection.find();
     const result= await cursor.toArray();
     res.send(result)
    })
    // get booking by id
    app.get('/booking/:id', verify,async(req,res)=>{
     const id =req.params.id;
     const query ={_id:new ObjectId(id)}
     const result = await bookingCollection.findOne(query)
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
      app.delete('/addServices/:id',   async (req,res)=>{
        const id=req.params.id;
        const query ={_id : new ObjectId(id)}
        const result = await addServiceCollection.deleteOne(query)
          res.send(result)
          });

          app.get('/addServices/:id', verify, async(req,res)=>{
            console.log(req.decode)
            try{
            const updateProduct = await addServiceCollection.findOne({
              _id:new ObjectId(req.params.id),
            });
            console.log(updateProduct);
            res.send(updateProduct)
          }catch(error){
            console.log(error)
          }
        });

        // update add service
        app.put('/addServices/:id',async (req,res)=>{
          const id = {_id:new ObjectId(req.params.id)}
          const body = req.body;
          const updateProduct = {
            $set:{
              ...body
          },
        };
        const option = {upsert:true}
        const result = await addServiceCollection.updateOne(id,updateProduct,option)
          console.log(body)
          res.send(result)
          });



          // update booking status pending
          app.put('/booking/:id/status',async(req,res)=>{
            const id = {_id:new ObjectId(req.params.id)}
            try{
              const query = {_id:new ObjectId(id)};
              const update={
                $set:{
                  "status":"status"
              }
            };
            const result = await bookingCollection.updateOne(query,update);
            if (result.modifiedCount > 0) {
              res.send({ success: true, message: "Booking status updated successfully" });
            } else {
              res.status(404).send({ success: false, message: "Booking not found" });
            }
          } catch (error) {
            console.error(error);
            res.status(500).send({ success: false, message: "An error occurred while updating booking status" });
          }

          })

          // jwt post
          app.post("/jwt",async(req,res)=>{
            const body= req.body
            const token = jwt.sign(body,process.env.SECRET,{expiresIn:"23h"});
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate()+30)
            // console.log(token)
            res
            .cookie("token",token,{
              httpOnly: true,
              secure:false,
              expires:expirationDate,
            })
            .send({message:"Succeed", token})
          })


          // google jwt post
          app.post('/google-jwt',async(req,res)=>{
            const googleToken = req.body
            const token = jwt.sign(googleToken,process.env.SECRET,{expiresIn:"23h"});
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate()+30)
            console.log("google-token" ,token)
            res
            .cookie("token",token,{
              httpOnly: true,
              secure:false,
              expires:expirationDate,
            })
            .send({message:"Succeed", token})
          })




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