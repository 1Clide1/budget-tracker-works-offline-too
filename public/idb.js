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
request.onsuccess = function (event) {
  // put the result in the db
  db = event.target.result;

  // this just checks if the app is online before it reads from the db
  if (navigator.onLine) {
    //cutsom function to check the database and get everything from the database
    uploadToDatabase();
  }
};
// the onerror function just in case something goes wrong
request.onerror = function (event) {
  // on error console log an error message
  console.log(
    "Looks like something went wrong check:" + event.target.errorCode
  );
};
// function to save transactions to the database
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  store.add(record);
}
// function to check the database and get all of the transactions from it
function uploadToDatabase() {
  // get all of the transactions
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  //   keep the same name as the actual indexxedDB function
  const getAll = store.getAll();
  // once the getAll is successful then run this function
  getAll.onsuccess = function () {
    //   if the length is bigger than 0 then grab everything from the indexxed db store and send it to api route api/transaction/bulk since that part of the api can submit many transactions at once
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          //   delete the transactions if they were already successful
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
          alert("All transactions were saved!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// this listens to when the app becomes online again
window.addEventListener("online", uploadToDatabase);
