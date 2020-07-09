
"use strict";

/**
 * Module dependencies
 */
const uuidv4 = require('uuid/v4');
const uuid = uuidv4();
const admin = require("firebase-admin");

module.exports = {
  init(config) {
    admin.initializeApp({
      credential: admin.credential.cert(config.serviceAccount),
      storageBucket: config.bucket,
    });
    const bucket = admin.storage().bucket();

    return {
      upload(file) {
        return new Promise((resolve, reject) => {
          const path = file.path ? `${file.path}/` : "";
          const filename = `${path}${file.hash}${file.ext}`;
          const buff = Buffer.from(file.buffer, "binary");
          const remoteFile = bucket.file(filename);
          remoteFile.save(
            buff,
            {
              contentType: file.mime,
              metadata: {
                metadata: {
                  firebaseStorageDownloadTokens: uuid,
                },
              },
              resumable: false,
              public: true,
            },
            (err) => {
              if (err) {
                reject(err);
              }
              file.url = `https://storage.googleapis.com/${config.bucket}/${filename}`;
              resolve();
            }
          );
        });
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          const path = file.path ? `${file.path}/` : "";
          const filename = `${path}${file.hash}${file.ext}`;
          const remoteFile = bucket.file(filename);
          remoteFile.delete((err, _) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        });
      },
    };
  },
};
