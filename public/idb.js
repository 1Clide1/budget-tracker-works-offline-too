// cool feature to see if a browser supports indexxedDB I am pretty sure this shouldn't be in a production code but I still think it would be useful in this setting
if (!window.indexedDB) {
  console.log(
    "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
  );
}
// create a variable to hold db connection
let db;
// let indexxed db establish connection to db
// setting this to the db i call budget and setting it to version 1
const request = indexedDB.open("budget", 1);
// this is here to basically say anytime we do anything in the database then we are going to update this and change to the newer version
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  //name can be anything but assuming this is supposed to help the app work when it is offline the I feel like the name pending is appropriate
  // key path just have it auto adding the # when the version is changed which is better than hard coding something because it will have the chance to throw errors
  db.createObjectStore("pending", { autoIncrement: true });
};
// after the update event then the success event should run
