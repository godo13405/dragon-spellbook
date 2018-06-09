const admin = require('firebase-admin');
const serviceAccount = require("./service-key.json");

const dataRaw = require("./spells.json"),
    data = {
        spells: dataRaw
    };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dnd-wiki-ca7bd.firebaseio.com"
});
Object.keys(data.spells).forEach(key => {
    deleteCollection(admin.firestore(), key, 1000);
});

function deleteCollection(db, collectionPath, batchSize) {
  var collectionRef = db.collection(collectionPath);
  var query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  }).then(d => {
    console.log(`${collectionPath} has been deleted`);
  }).catch(e => {
    console.log('Failed to delete');
    console.log(e);
  });
}


function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size === 0) {
          return 0;
        }

        // Delete documents in a batch
        var batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted === 0) {
          resolve();
          return;
        }

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
      })
      .catch(reject);
}
