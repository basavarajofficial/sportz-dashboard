import express from 'express';
import { matchRouter } from './routes/matches.js';

const app = express();
const PORT = process.env.PORT || 8000;

// This enable parsing of JSON bodies in requests in middleware, so we can access req.body in our routes handlers
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello from Sportz!")
});

app.use('/matches', matchRouter);

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}/`);
});
