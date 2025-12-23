const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Registered users array


// Helper Functions
// ===============================

// Check if a username is valid (not empty and not already taken)
const isValid = (username) => {
    if (!username) return false;
    return !users.some(user => user.username === username);
};

// Check if username and password match a registered user
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};


// JWT Authentication Middleware
// ===============================
const authenticateJWT = (req, res, next) => {
    const auth = req.session.authorization;

    if (!auth || !auth.accessToken) {
        return res.status(401).json({ message: "User not logged in" });
    }

    jwt.verify(auth.accessToken, "access", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user; // { username }
        next();
    });
};


// Login Route
// ===============================
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    // Generate JWT
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // Save token in session
    req.session.authorization = { accessToken: token };

    return res.status(200).json({
        message: "Login successful",
        token
    });
});


// Add or Modify Book Review
// ===============================
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review query is required" });
    }

    // Add or update review for this user
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});


regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "No review found for this user"
        });
    }

    // Delete only logged-in user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
