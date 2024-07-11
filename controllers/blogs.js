const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

// GET route to fetch all blogs
blogsRouter.get('/', (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs);
  });
});

// POST route to create a new blog
blogsRouter.post('/', (request, response) => {
  const body = request.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0  // Default to 0 if likes is not provided
  });

  blog.save().then(result => {
    response.status(201).json(result);
  });
});
module.exports = blogsRouter;