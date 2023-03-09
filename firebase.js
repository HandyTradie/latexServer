const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
var serviceAccount = require("./quizmine-a809e-firebase-adminsdk-ihc77-f9f2d6b53a.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "quizmine-a809e.appspot.com",
});
const db = getFirestore();
const bucket = getStorage().bucket();
exports.bucket = bucket;
exports.db = db;
