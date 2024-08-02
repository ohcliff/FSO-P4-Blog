const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

// GET route to fetch all blogs
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
});

// POST route to create a new blog
blogsRouter.post('/', async (request, response) => {
  const body = request.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0  // Default to 0 if likes is not provided
  });
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
});

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  await Blog.findByIdAndDelete(id)
  response.status(204).end();
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    { likes: body.likes }, // You can add other fields as needed
    { new: true, runValidators: true } // Returns the updated document
  );

  if (updatedBlog) {
    response.json(updatedBlog);
  } else {
    response.status(404).end();
  }
});
module.exports = blogsRouter;