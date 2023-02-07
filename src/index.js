const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find((user) => user.username === username);
  
  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  
  const { name, username } = request.body;
  
  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };
  
  const userAlreadyExists = users.some((user) => user.username === username);

  
  if (userAlreadyExists) {
    return response.status(400).json({ error: "This username already exists" });
    
  } else {
    
    users.push(user);
    
    return response.status(201).json(user);
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const task = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(task);
  return response.status(201).json(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;
  const task = user.todos.find((task) => task.id === id);
  if (task) {
    task.title = title;
    task.deadline = new Date(deadline);
    return response.json(task);
  }
  return response.status(404).json({error:"Task not found!"});
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const task = user.todos.find((task) => task.id === id);
  if(task){
    task.done = true;
    return response.json(task);
  }
  return response.status(404).json({error:"Task not found!"});
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const index = user.todos.findIndex((task) => task.id === id);
  if (index !== -1) {
    user.todos.splice(index, 1);
    return response.status(204).json();
  }
  return response.status(404).json({error:"Task not found!"});
});

module.exports = app;
