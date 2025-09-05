const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Blog Post Schema
const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: './assets/images/blog/blog-placeholder.jpg' },
    date: { type: Date, default: Date.now }
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// API Routes
// POST a new blog post
app.post('/api/posts', async (req, res) => {
    try {
        const newPost = new BlogPost(req.body);
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data provided.' });
    }
});

// GET all blog posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await BlogPost.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving posts.' });
    }
});

// GET a single blog post by ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving post.' });
    }
});

// DELETE a blog post by ID
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post.' });
    }
});

// New API route to get GitHub repos
app.get('/api/github-repos', async (req, res) => {
    try {
        const githubUsername = 'akash9569';
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos`);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub repositories.');
        }
        const repos = await response.json();
        res.json(repos);
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        res.status(500).json({ message: 'Error retrieving GitHub repositories.' });
    }
});

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
