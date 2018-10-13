window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
if (!window.indexedDB) {
    // 브라우저 indexedDB 지원 체크
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}
const dbName = "user";
const indexdDB = window.indexedDB.open(dbName, 1);
let db;

// indexedDB open async onerror, onsuccess
indexdDB.onerror = (event) => {
    console.log("indexedDB open error");
};
indexdDB.onsuccess = (event) => {
    try{
        db = indexdDB.result;
        readAll();
    }catch(e){
        console.log(e);
    }
};
indexdDB.onupgradeneeded = (event) => {
    try{
        db = event.target.result;
        db.createObjectStore(dbName, { keyPath: "userId"} );
    }catch(e){
        console.log(e);
    }
};

const read = (id) => {
    try{
        let objectStore = db.transaction(dbName).objectStore(dbName);
        let request = objectStore.get(id);
        request.onerror = (event) => {
            console.log("log: read() onerror");
        };
        request.onsuccess = (event) => {
            console.log(request.result);
        };
    }
    catch(e){
        console.log(e);
    }
}

const readAll = () => {
    try{
        let objectStore = db.transaction(dbName).objectStore(dbName);
        let request = objectStore.getAll();
        request.onerror = (event) => {
            console.log("log: readAll() onerror");
        };
        request.onsuccess = (event) => {
            console.log("log: readAll() onsuccess");
            if(request.result.length == 0){
                $('#user_info_modal').modal({backdrop: 'static'});
                $('#user_info_modal').modal();
            }else{
                userId = request.result[0].userId;
                userName = request.result[0].userName;
                connect();
                serverMessages.push(guideMessageCreater.create({data:`환영합니다 ${userName}님! 잠시만 기다려주시면 메세지를 전달해 드릴께요 :)`}));
            }
        }
    }catch(e){
        console.log(e);
    }
}

const add = (user) => {
    try{
        let request = db.transaction([dbName], "readwrite").objectStore(dbName).add(user);
        request.onsuccess = (event) => {
            console.log("log: add() onsuccess");
        };
        request.onerror = (event) => {
            console.log("log: add() onerror");
        }
    }catch(e){
        console.log(e);
    }
}

const remove = (userId) => {
    try{
        let request = db.transaction([dbName], "readwrite").objectStore(dbName).delete(userId);
        request.onsuccess = (event) => {
            console.log("log: remove() onsuccess");
        };
        request.onerror = (event) => {
            console.log("err: remove() onerror");
        }
    }
    catch(e){
        console.log(e);
    }
}