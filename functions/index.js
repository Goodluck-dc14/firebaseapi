const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));

// permission service

const serviceAccount = require("./permission.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
// welcome message
app.get("/", async (req, res) => {
  res.send("Serverles API");
});

// get all student biodata
app.get("/api/student", async (req, res) => {
  try {
    const querySnapshot = await db.collection("StudentData").get();
    const document = [];
    await querySnapshot.forEach((doc) => {
      document.push({ id: doc.id, data: doc.data() });
    });
    if (document.length <= 0) {
      res.status(404).json({ message: "No data" });
    } else {
      res.status(200).json({ message: "All document", data: document });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// creating new student
app.post("/api/student", async (req, res) => {
  try {
    const data = {
      course: req.body.course,
      duration: req.body.duration,
      name: req.body.name,
    };
    const document = await db.collection("StudentData").doc().set(data);
    if (!document) {
      res.status(404).json({ message: "Can not create student" });
    } else {
      res.status(200).json({ message: "Created successfully", data: document });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// updating a student
app.patch("/api/student/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const document = await db.collection("StudentData").doc(id);
    if (!id) {
      res.status(404).json({ message: `id: ${id} is recognized.` });
    } else {
      const data = {
        course: req.body.course,
        duration: req.body.duration,
        name: req.body.name,
      };
      const updateStudent = await document.update(data);
      res.status(200).json({ message: "Updated Successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete a student
app.delete("/api/student/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const document = await db.collection("StudentData").doc(id);
    if (!id) {
      res.status(404).json({ message: `id: ${id} is recognized.` });
    } else {
      const deletedDocument = await document.delete();
      res.status(200).json({ message: "Deleted Successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
