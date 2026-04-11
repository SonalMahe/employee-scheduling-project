# MongoDB & Mongoose

## 1. Overview

MongoDB is a **NoSQL database** that stores data in JSON-like format (documents).
Mongoose is a library that helps structure and manage MongoDB data in Node.js.

---

## 2. Why Use It?

* Flexible data structure (no fixed schema)
* Easy to use with JavaScript
* Mongoose adds validation and structure

---

## 3. Installation

```bash
npm install mongoose
```

---

## 4. Database Connection

```js
import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));
```

---

## 5. Schema & Model

```js
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number
});

const User = mongoose.model("User", userSchema);
```

---

## 6. CRUD Operations

### Create

```js
await User.create({ name: "John", email: "john@test.com", age: 25 });
```

### Read

```js
const users = await User.find();
```

### Update

```js
await User.findByIdAndUpdate(id, { age: 30 });
```

### Delete

```js
await User.findByIdAndDelete(id);
```

---

## 7. Validation Example

```js
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});
```

---

## 8. Summary

* MongoDB stores data
* Mongoose manages and validates data
* Use models to interact with database
* Supports all CRUD operations

---
