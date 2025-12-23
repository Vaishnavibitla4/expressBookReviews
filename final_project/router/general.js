const express = require('express');
const axios = require('axios'); // ✅ Axios added
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

/**
 * TASK 1:
 * Get the book list available in the shop
 * Implemented using async/await with Axios
 */
public_users.get('/', async function (req, res) {
    try {
        // Axios call to fetch books (self-call for demonstration)
        const response = await axios.get("http://localhost:5000/");
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching book list",
            error: error.message
        });
    }
});

// ---------------------------------------------------
// Get book details based on ISBN
// ---------------------------------------------------
// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject("Book not found");
                }
            });
        };

        const book = await getBookByISBN(isbn);
        return res.status(200).json(book);

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});


// ---------------------------------------------------
// Get book details based on author
// ---------------------------------------------------
// Get book details based on Author using async/await
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author.toLowerCase();

    try {
        const getBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                const result = [];

                Object.keys(books).forEach(isbn => {
                    if (books[isbn].author.toLowerCase() === author) {
                        result.push({ isbn, ...books[isbn] });
                    }
                });

                if (result.length > 0) {
                    resolve(result);
                } else {
                    reject("No books found for this author");
                }
            });
        };

        const booksByAuthor = await getBooksByAuthor(author);
        return res.status(200).json(booksByAuthor);

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});


// ---------------------------------------------------
// Get all books based on title
// ---------------------------------------------------
// Get all books based on Title using async/await
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title.toLowerCase();

    try {
        const getBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                const result = [];

                Object.keys(books).forEach(isbn => {
                    if (books[isbn].title.toLowerCase() === title) {
                        result.push({ isbn, ...books[isbn] });
                    }
                });

                if (result.length > 0) {
                    resolve(result);
                } else {
                    reject("No books found with this title");
                }
            });
        };

        const booksByTitle = await getBooksByTitle(title);
        return res.status(200).json(booksByTitle);

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});


// ---------------------------------------------------
// Get book review
// ---------------------------------------------------
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// ---------------------------------------------------
// Register a new user
// ---------------------------------------------------
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (!isValid(username)) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    users.push({ username, password });
    return res.status(201).json({
        message: "User registered successfully"
    });
});

module.exports.general = public_users;
