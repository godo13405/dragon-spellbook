const admin = require('firebase-admin');
const serviceAccount = require("./service-key.json");

const data = {
        spells: require("./data/spells.json"),
        conditions: require("./data/conditions.json")
    };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dnd-wiki-ca7bd.firebaseio.com"
});
data && Object.keys(data).forEach(key => {
    let nestedContent = data[key];

    if (typeof nestedContent === "object") {
        Object.keys(nestedContent).forEach(docTitle => {
            admin.firestore()
                .collection(key)
                .doc(docTitle)
                .set(nestedContent[docTitle])
                .then((res) => {
                    if (process.env.DEBUG) console.log(`${docTitle} added`);
                    return true;
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                    return false;
                });
        });
    }
});