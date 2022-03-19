import { MongoClient } from 'mongodb';
import nextConnect from 'next-connect';

const client = new MongoClient(process.env.DB_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function database(req, res, next) {
    console.log(client);
  await client.connect();
  req.dbClient = client;
  req.db = client.db('balakadb');
  return next();
}

const middleware = nextConnect();

middleware.use(database);

export default middleware;