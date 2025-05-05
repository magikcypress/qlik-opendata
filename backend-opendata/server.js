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
app.use(cors({ origin: '*' }));

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
const applicationSchema = new mongoose.Schema({
	qId: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	description: { type: String },
	eac: { type: String, required: true },
	publishedAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	active: { type: Boolean, default: false }
});

const Application = mongoose.model('Application', applicationSchema);

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
	active: { type: Boolean, default: false }
});

const Sheet = mongoose.model('Sheet', sheetSchema);

const objectSchema = new mongoose.Schema({
	qId: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	type: { type: String, required: true },
	col: { type: String, required: true },
	row: { type: String, required: true },
	colspan: { type: String, required: true },
	rowspan: { type: String, required: true },
	bounds: { type: Array, required: true },
	active: { type: Boolean, default: false }
});

const Object = mongoose.model('Object', objectSchema);

const dimensionSchema = new mongoose.Schema({
	qId: { type: String, required: true, unique: true },
	title: { type: String, required: true },
	field: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	active: { type: Boolean, default: false }
});

const Dimension = mongoose.model('Dimension', dimensionSchema);

const measureSchema = new mongoose.Schema({
	qId: { type: String, required: true, unique: true },
	title: { type: String, required: true },
	expression: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	active: { type: Boolean, default: false }
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
	active: { type: Boolean, default: false }
});

const Metadata = mongoose.model('Metadata', metadataSchema);

const publicationSchema = new mongoose.Schema({
	title: { type: String, required: true, unique: true },
	description: { type: String },
	author: { type: String, required: true },
	category: { type: String, required: true },
	application: { type: String, required: true },
	qId: { type: String, required: true },
	aec: { type: String, required: true },
	publishedAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	data: { type: mongoose.Schema.Types.Mixed },
	active: { type: Boolean, default: false }
});

const Publication = mongoose.model('Publication', publicationSchema);

const categorySchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	active: { type: Boolean, default: false }
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

app.get('/backend/applications', async (req, res) => {
	try {
		const applications = await Application.find();
		res.json(applications);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/applications/:id', async (req, res) => {
	try {
		const application = await Application.findOne({ qId: req.params.id });
		if (!application) {
			return res.status(404).json({ message: 'Application not found' });
		}
		res.json(application);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.post('/backend/applications', async (req, res) => {
	try {
		const newApplication = new Application(req.body);
		await newApplication.save();
		res.json(newApplication);
	} catch (error) {
		if (error.code === 11000) {
			res.status(400).json({ message: 'Duplicate entry detected' });
		} else {
			res.status(500).json({ message: 'An error occurred' });
		}
	}
});

app.delete('/backend/applications/:id', async (req, res) => {
	try {
		const application = await Application.findOneAndDelete({ qId: req.params.id });

		if (!application) {
			return res.status(404).json({ message: 'Application not found' });
		}
		res.json({ message: 'Application deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/sheets', async (req, res) => {
	try {
		const sheets = await Sheet.find();
		res.json(sheets);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/sheets/:id', async (req, res) => {
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

app.post('/backend/sheets', async (req, res) => {
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

app.put('/backend/sheets/:id/active', async (req, res) => {
	try {
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

app.delete('/backend/sheets', async (req, res) => {
	try {
		await Sheet.deleteMany({});
		res.json({ message: 'All sheets deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.delete('/backend/sheets/:id', async (req, res) => {
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

app.get('/backend/objects', async (req, res) => {
	try {
		const objects = await Object.find();
		res.json(objects);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/objects/:id', async (req, res) => {
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

app.post('/backend/objects', async (req, res) => {
	try {
		const newObject = new Object(req.body);
		await newObject.save();
		res.json(newObject);
	} catch (error) {
		if (error.code === 11000) {
			res.status(400).json({ message: 'Duplicate entry detected' });
		} else {
			res.status(500).json({ message: 'An error occurred' });
		}
	}
});

app.put('/backend/objects/:id/active', async (req, res) => {
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

app.delete('/backend/objects', async (req, res) => {
	try {
		await Object.deleteMany({});
		res.json({ message: 'All objects deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.delete('/backend/objects/:id', async (req, res) => {
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

app.get('/backend/dimensions', async (req, res) => {
	try {
		const dimensions = await Dimension.find();
		res.json(dimensions);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/dimensions/:id', async (req, res) => {
	try {
		const dimensions = await Dimensions.findOne({ qId: req.params.id });
		if (!dimensions) {
			return res.status(404).json({ message: 'Dimension not found' });
		}
		res.json(dimensions);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.post('/backend/dimensions', async (req, res) => {
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

app.delete('/backend/dimensions/:id', async (req, res) => {
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

app.get('/backend/measures', async (req, res) => {
	try {
		const measures = await Measure.find();
		res.json(measures);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/measures/:id', async (req, res) => {
	try {
		const measures = await Measure.findOne({ qId: req.params.id });
		if (!measures) {
			return res.status(404).json({ message: 'Measure not found' });
		}
		res.json(measures);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.post('/backend/measures', async (req, res) => {
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

app.delete('/backend/measures/:id', async (req, res) => {
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

app.get('/backend/metadata', async (req, res) => {
	try {
		const metadata = await Metadata.find();
		res.json(metadata);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/metadata/:id', async (req, res) => {
	try {
		const metadatas = await Metadata.findOne({ qId: req.params.id });
		if (!metadatas) {
			return res.status(404).json({ message: 'Metadata not found' });
		}
		res.json(metadatas);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.post('/backend/metadata', async (req, res) => {
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

app.delete('/backend/metadata/:id', async (req, res) => {
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

app.get('/backend/publications', async (req, res) => {
	try {
		const publications = await Publication.find();
		res.json(publications);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/publications/:id', async (req, res) => {
	try {
		const publications = await Publication.findOne({ _id: req.params.id });
		if (!publications) {
			return res.status(404).json({ message: 'Publication not found' });
		}
		res.json(publications);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.put('/backend/publications/:id', async (req, res) => {
	try {

		console.log(req.body);
		const { application, aec, qId, title, description, author, category, data, active } = req.body;
		const publication = await Publication.findByIdAndUpdate(
			req.params.id,
			{ application, aec, qId, title, description, author, category, data, active, updatedAt: Date.now() },
			{ new: true }
		);
		if (!publication) {
			return res.status(404).json({ error: 'Publication not found' });
		}
		res.status(200).json(publication);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/backend/publications', async (req, res) => {
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

app.delete('/backend/publications/:id', async (req, res) => {
	console.log(req.params.id);
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

app.delete('/backend/publications', async (req, res) => {
	try {
		await Publication.deleteMany({});
		res.json({ message: 'All publications deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/categories', async (req, res) => {
	try {
		const categories = await Category.find();
		res.json(categories);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/categories/:id', async (req, res) => {
	try {
		const categories = await Category.findOne({ _id: req.params.id });
		if (!categories) {
			return res.status(404).json({ message: 'Category not found' });
		}
		res.json(categories);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.put('/backend/categories/:id', async (req, res) => {
	try {
		const { title, description, active } = req.body;
		const categorie = await Category.findByIdAndUpdate(
			req.params.id,
			{ title, description, active, updatedAt: Date.now() },
			{ new: true }
		);
		if (!categorie) {
			return res.status(404).json({ error: 'Categorie not found' });
		}
		res.status(200).json(categorie);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/backend/categories', async (req, res) => {
	try {
		console.log(req.body);
		const newCategory = new Category(req.body);
		await newCategory.save();
		res.json(newCategory);
	} catch (error) {
		console.log(error);
		if (error.code === 11000) {
			res.status(400).json({ message: 'Duplicate entry detected' });
		} else {
			res.status(500).json({ message: 'An error occurred' });
		}
	}
});

app.delete('/backend/categories', async (req, res) => {
	try {
		await Category.deleteMany({});
		res.json({ message: 'All categories deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.delete('/backend/categories/:id', async (req, res) => {
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

app.get('/backend/comments', async (req, res) => {
	try {
		const comments = await Comment.find();
		res.json(comments);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.get('/backend/comments/:id', async (req, res) => {
	try {
		const comments = await Comment.findOne({ qId: req.params.id });
		if (!comments) {
			return res.status(404).json({ message: 'Category not found' });
		}
		res.json(comments);
	} catch (error) {
		res.status(500).json({ message: 'An error occurred' });
	}
});

app.post('/backend/comments', async (req, res) => {
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

app.delete('/backend/comments/:id', async (req, res) => {
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