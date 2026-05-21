const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express');
const dontenv = require('dotenv')
const app = express();
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
dontenv.config()
const uri = process.env.MONGODB_URI;
const port = process.env.PORT;

app.use(cors())
app.use(express.json())



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const JWKS = createRemoteJWKSet(new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db('some-bokks');
    const productsCollection = db.collection('products');
    const bookingCollection = db.collection("booking");

    app.post("/add-car", async (req, res) => {
      const car = req.body
      console.log(car)
      const result = await productsCollection.insertOne(car)
      res.json(result)
    })

    app.get('/explore', async (req, res) => {
      const products = await productsCollection.find().toArray()
      res.send(products)
    })
    app.get('/details/:id', async (req, res) => {
      const id = new ObjectId(req.params.id)
      const products = await productsCollection.findOne({ _id: id })

      res.send(products)
    })
    //   app.patch('/details/:id', async(req, res) => {
    //     const id = new ObjectId(req.params.id)
    //     const updatedData = req.body
    // const result =await productsCollection.insertOne(
    //   {_id: new ObjectId(id)},
    //   {$set:updatedData}
    // )
    // res.json(result)

    // // res.send(products)
    //  })
    app.patch('/details/:id', async (req, res) => {

      const id = req.params.id
      const updatedData = req.body

      const result = await productsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updatedData
        }
      )

      res.json(result)
    })
    app.delete('/explore/:id', async (req, res) => {

      const id = req.params.id


      const result = await productsCollection.deleteOne(
        { _id: new ObjectId(id) },

      )
      res.json(result)
    })
    app.post("/booking",  async (req, res) => {
      const bookingData = {
        ...req.body,
        booking_count: 1,
      };

      const result = await bookingCollection.insertOne(bookingData);

      await bookingCollection.updateOne(
        { _id: new ObjectId(bookingData.exploreId) },
        {
          $inc: {
            booking_count: 1,
          },
        }
      );
      console.log(result)
      res.json(result);
    });
    app.get("/booking/:userId", async (req, res) => {
      const { userId } = req.params;

      const result = await bookingCollection.find({ userId: userId }).toArray();

      res.json(result);
    });
    app.delete("/booking/:bookingId",  async (req, res) => {
      const { bookingId } = req.params;
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(bookingId),
      });

      res.json(result);
    });

    app.get("/cars/user/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await productsCollection.find({ userId: userId }).toArray();


      res.json(result);
    });


   
app.get("/explore-cars", async (req, res) => {
  const { search, category } = req.query;

  const query = {};

 
  if (search) {
    query.carName = { $regex: search, $options: "i" }; 
  }

 
  if (category) {
    query.category = { $in: [category] };
  }

  const result = await productsCollection.find(query).toArray();
  res.json(result);
  });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from monimul World!')
})
app.get('/products/:id', function (req, res, next) {
  res.json({ msg: 'Hello' })
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})