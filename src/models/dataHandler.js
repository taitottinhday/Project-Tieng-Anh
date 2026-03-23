const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const usersFile = path.join(__dirname, "../../data/users.txt");

// Helper to read users
function readUsers() {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile, "utf8");
  return data
    .split("\n")
    .filter(line => line.trim() !== "")
    .map(line => JSON.parse(line));
}

// Helper to write users
function writeUsers(users) {
  const data = users.map(u => JSON.stringify(u)).join("\n");
  fs.writeFileSync(usersFile, data, "utf8");
}

// Register a new user
async function registerUser({ username, email, password }) {
  const users = readUsers();
  const existing = users.find(u => u.email === email);
  if (existing) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    username,
    email,
    password: hashedPassword,
    role: "user"
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

// Login user
async function loginUser({ email, password }) {
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("No user found with this email");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Incorrect password");

  return user;
}

const messagesFile = path.join(__dirname, "../../data/messages.txt");

// Fetch all messages
function readMessages() {
  if (!fs.existsSync(messagesFile)) return [];
  const data = fs.readFileSync(messagesFile, "utf8");
  return data
    .split("\n")
    .filter(line => line.trim() !== "")
    .map(line => JSON.parse(line));
}

// Write messages to file
function writeMessages(messages) {
  const data = messages.map(m => JSON.stringify(m)).join("\n");
  fs.writeFileSync(messagesFile, data, "utf8");
}

// Delete a message (by ID)
function deleteMessage(id) {
  const messages = readMessages();
  const filteredMessages = messages.filter(m => m.id !== parseInt(id));
  writeMessages(filteredMessages);
}

module.exports = {
  readUsers,
  writeUsers,
  registerUser,
  loginUser,
  readMessages,
  writeMessages,
  deleteMessage
};

