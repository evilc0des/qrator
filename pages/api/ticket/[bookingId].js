import nextConnect from 'next-connect';
import middleware from '../../../middleware/database';
import {ObjectId} from 'mongodb'

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req, res) => {
    const { bookingId } = req.query
    console.log(bookingId);
    let doc = await req.db.collection('ticket').findOne({
        bookingId: { $eq: bookingId }
    });
    console.log(doc);
    res.json(doc || {});
});

handler.post(async (req, res) => {
    const { bookingId } = req.query
    console.log(bookingId);
    const body = JSON.parse(req.body)

    if(body.admit) {
        let doc = await req.db.collection('ticket').updateOne({
            bookingId: { $eq: bookingId }
        },{ $set: { admitted: true } });
        console.log(doc);
        res.json(doc);
    }
});

handler.put(async (req, res) => {
    const { bookingId } = req.query
    console.log(bookingId);

    const body = JSON.parse(req.body)
    let doc = await req.db.collection('ticket').insertOne({
        bookingId: body.bookingId,
        seats: body.seats,
        time: body.time,
        admitted: false
    });
    console.log(doc);
    res.json(doc);
});

handler.delete(async (req, res) => {
    const { bookingId } = req.query
    console.log(bookingId);
    let doc = await req.db.collection('ticket').deleteOne({ "_id" : ObjectId(bookingId) });
    console.log(doc);
    res.json(doc);
});

export default handler;