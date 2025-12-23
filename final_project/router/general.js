const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();




// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
   return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;  // get ISBN from URL parameter

    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;  // Get author name from URL
    const matchingBooks = [];

    // Get all book keys
    const bookKeys = Object.keys(books);

    // Iterate through books and check for matching author
    for (let key of bookKeys) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            matchingBooks.push({ isbn: key, ...books[key] });
        }
    }

    if (matchingBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;  // Get title from URL
    const matchingBooks = [];

    // Get all book keys
    const bookKeys = Object.keys(books);

    // Iterate through books and check for matching title
    for (let key of bookKeys) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            matchingBooks.push({ isbn: key, ...books[key] });
        }
    }

    if (matchingBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;  // Get ISBN from URL

    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

module.exports.general = public_users;
