const admin = require('firebase-admin');
const serviceAccount = require('../secret/dinefinder-203c7-37bf680da269.json');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://dinefinder-203c7.appspot.com'
});
const storage = new Storage({
  projectId: serviceAccount.project_id,
  keyFilename: path.join(__dirname, `../secret/dinefinder-203c7-37bf680da269.json`),
})

// const bucket = admin.storage().bucket()
const bucket = storage.bucket(`${serviceAccount.project_id}.appspot.com`);
const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, bucket, storage };