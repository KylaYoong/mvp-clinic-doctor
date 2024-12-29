const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.resetQueueDaily = functions.pubsub.schedule("every day 00:00").onRun(async (context) => {
    const db = admin.firestore();
    const queueRef = db.collection("queue");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await queueRef.where("timestamp", "<", today).get();

    const batch = db.batch();
    snapshot.forEach((doc) => {
        batch.delete(doc.ref); // Or update the status to "archived"
    });

    await batch.commit();
    console.log("Queue reset for the day.");
});
