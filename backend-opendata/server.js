const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { auth } = require('express-openid-connect');
const crypto = require('crypto');
const path = require('path');

const randomString = crypto.randomBytes(8).toString("hex");

const app = express();

const port = process.env.PORT || 3003;

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET || randomString,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.DOMAIN
};

app.use(auth(config));
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {

}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const UserSchema = new mongoose.Schema({
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

app.use(
    session({
        secret: randomString,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
    })
);

// Define a schema and model
const commentSchema = new mongoose.Schema({
    publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

const sheetSchema = new mongoose.Schema({
    qId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    approved: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    owner: { type: String, required: true },
    ownerId: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date, default: Date.now },
    publishTime: { type: Date },
    active: { type: Boolean, default: true }
});

const Sheet = mongoose.model('Sheet', sheetSchema);

const objectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    col: { type: String, required: true },
    row: { type: String, required: true },
    colspan: { type: String, required: true },
    rowspan: { type: String, required: true },
    bounds: { type: Array, required: true },
    active: { type: Boolean, default: true }
});

const Object = mongoose.model('Object', objectSchema);

const dimensionSchema = new mongoose.Schema({
    qId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    field: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

const Dimension = mongoose.model('Dimension', dimensionSchema);

const measureSchema = new mongoose.Schema({
    qId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    expression: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

const Measure = mongoose.model('Measure', measureSchema);

const metadataSchema = new mongoose.Schema({
    datasetId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    keywords: [String],
    publisher: { type: String },
    contactPoint: { type: String },
    license: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

const Metadata = mongoose.model('Metadata', metadataSchema);

const publicationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    author: { type: String, required: true },
    publishedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    active: { type: Boolean, default: true }
});

const Publication = mongoose.model('Publication', publicationSchema);

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

const Category = mongoose.model('Category', categorySchema);

// Define routes
app.use('/data', express.static(path.join(__dirname, '../data')));
app.use('/images', express.static(path.join(__dirname, '../frontend-opendata/src/assets/images')));

app.get('/profile', async (req, res) => {
    if (req.oidc.isAuthenticated()) {
        const user = await User.findOne({ auth0Id: req.oidc.user.sub });
        if (!user) {
            const newUser = new User({
                auth0Id: req.oidc.user.sub,
                email: req.oidc.user.email,
                name: req.oidc.user.name
            });
            await newUser.save();
        }
        res.send(req.oidc.user);
    } else {
        res.send('Not authenticated');
    }
});

app.get('/sheets', async (req, res) => {
    try {
        const sheets = await Sheet.find();
        console.log(sheets);
        res.json(sheets);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/sheets/:id', async (req, res) => {
    try {
        const sheet = await Sheet.findOne({ qId: req.params.id });
        if (!sheet) {
            return res.status(404).json({ message: 'Sheet not found' });
        }
        res.json(sheet);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/sheets', async (req, res) => {
    try {
        const newSheet = new Sheet(req.body);
        await newSheet.save();
        res.json(newSheet);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate entry detected' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
});

app.put('/sheets/:id/active', async (req, res) => {
    try {
        console.log(req.params.id);
        const sheet = await Sheet.findOne({ qId: req.params.id });
        if (!sheet) {
            return res.status(404).json({ message: 'Sheet not found' });
        }
        sheet.active = !sheet.active; // Toggle the active state
        await sheet.save();
        res.json(sheet);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.delete('/sheets/:id', async (req, res) => {
    try {
        const sheet = await Sheet.findOneAndDelete({ qId: req.params.id });
        if (!sheet) {
            return res.status(404).json({ message: 'Sheet not found' });
        }
        res.json({ message: 'Sheet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/objects', async (req, res) => {
    try {
        const objects = await Object.find();
        res.json(objects);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/objects/:id', async (req, res) => {
    try {
        const objects = await Object.findOne({ name: req.params.name });
        if (!objects) {
            return res.status(404).json({ message: 'Object not found' });
        }
        res.json(objects);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/objects', async (req, res) => {
    try {
        console.log(req.body);
        const newObject = new Object(req.body);
        await newObject.save();
        res.json(newObject);
        console.log(res);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate entry detected' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
});


app.put('/objects/:id/active', async (req, res) => {
    try {
        const object = await Object.findOne({ name: req.params.id });
        if (!object) {
            return res.status(404).json({ message: 'Object not found' });
        }
        object.active = !object.active; // Toggle the active state
        await object.save();
        res.json(object);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.delete('/objects/:id', async (req, res) => {
    try {
        const object = await Object.findOneAndDelete({ name: req.params.id });
        if (!object) {
            return res.status(404).json({ message: 'Object not found' });
        }
        res.json({ message: 'Object deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/dimensions', async (req, res) => {
    try {
        const dimensions = await Dimension.find();
        res.json(dimensions);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/dimensions', async (req, res) => {
    try {
        const newDimension = new Dimension(req.body);
        await newDimension.save();
        res.json(newDimension);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate entry detected' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
});

app.delete('/dimensions/:id', async (req, res) => {
    try {
        const dimension = await Dimension.findOneAndDelete({ qId: req.params.id });
        if (!dimension) {
            return res.status(404).json({ message: 'Dimension not found' });
        }
        res.json({ message: 'Dimension deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/measures', async (req, res) => {
    try {
        const measures = await Measure.find();
        res.json(measures);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/measures', async (req, res) => {
    try {
        const newMeasure = new Measure(req.body);
        await newMeasure.save();
        res.json(newMeasure);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate entry detected' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
});

app.delete('/measures/:id', async (req, res) => {
    try {
        const measure = await Measure.findOneAndDelete({ qId: req.params.id });
        if (!measure) {
            return res.status(404).json({ message: 'Measure not found' });
        }
        res.json({ message: 'Measure deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/metadata', async (req, res) => {
    try {
        const metadata = await Metadata.find();
        res.json(metadata);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/metadata', async (req, res) => {
    try {
        const newMetadata = new Metadata(req.body);
        await newMetadata.save();
        res.json(newMetadata);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate entry detected' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
});

app.delete('/metadata/:id', async (req, res) => {
    try {
        const metadata = await Metadata.findOneAndDelete({ datasetId: req.params.id });
        if (!metadata) {
            return res.status(404).json({ message: 'Metadata not found' });
        }
        res.json({ message: 'Metadata deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/publications', async (req, res) => {
    try {
        const publications = await Publication.find();
        res.json(publications);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/publications', async (req, res) => {
    try {
        const newPublication = new Publication(req.body);
        await newPublication.save();
        res.json(newPublication);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate entry detected' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
});

app.delete('/publications/:id', async (req, res) => {
    try {
        const publication = await Publication.findOneAndDelete({ _id: req.params.id });
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }
        res.json({ message: 'Publication deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/categories', async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.json(newCategory);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate entry detected' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
});

app.delete('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/comments', async (req, res) => {
    try {
        const newComment = new Comment(req.body);
        await newComment.save();
        res.json(newComment);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate entry detected' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
});

app.delete('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({ _id: req.params.id });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});