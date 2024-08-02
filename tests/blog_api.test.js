const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert') // Import the assert module
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)
const initialBlogs = [
    {
        title: "Cliff's blog",
        author: "Cliff",
        url: "www.cliff.com",
        likes: 10000
    },
    {
        title: "Kevins Blog",
        author: "Kevin",
        url: "www.kevin.com",
        likes: 150000
    }
]
beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})
test('There are two blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
})

test('unique identifier property of blogs is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    assert.ok(blog.id, 'Blog does not have an id field')
    assert.strictEqual(typeof blog.id, 'string', 'Blog id is not a string')
    assert.strictEqual(blog._id, undefined, 'Blog has _id field')
})

test('a valid note can be added', async () => {
    const newBlog = {
            title: "mom's blog",
            author: "mom",
            url: "www.mom.com",
            likes: 101000
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)

})

test('a note can be deleted', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogDelete = blogsAtStart.body[0]

    await api
        .delete(`/api/blogs/${blogDelete.id}`)
        .expect(204)
    const blogEnd = await api.get('/api/blogs')
    assert.strictEqual(blogEnd.body.length, blogsAtStart.body.length-1)
    const ids = blogEnd.body.map(blog => blog.id)
    assert.ok(!ids.includes(blogDelete.id))
})

test('a blog can be updated', async () => {
    const blogsAtStart = await api.get('/api/blogs');
    const blogToUpdate = blogsAtStart.body[0];

    const updatedBlogData = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1
    };

    const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlogData)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    const updatedBlog = response.body;
    assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1);
});
after(async () => {
    await mongoose.connection.close()
})