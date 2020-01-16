
// For the main layout
document.getElementById('FirebaseSignIn').addEventListener("click",signIn);
document.getElementById('FirebaseSignOut').addEventListener("click",signOut);

function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}

// TODO: replace with your Firebase project configuration.
var config = {
  apiKey: "AIzaSyCBv2ZbitECQn1n3FPCpRhV15yy8-L3vwY",
  authDomain: "burning-notes-code-sharing.firebaseapp.com",
  databaseURL: "https://burning-notes-code-sharing.firebaseio.com",
  storageBucket: "gs://burning-notes-code-sharing.appspot.com"
};
// Initialize Firebase.
var app = firebase.initializeApp(config);
var firepad = null;
var codeMirror = null;
var firepadUserList = null;
// Initializing individual Firepads
function initializeFirepad(firepadDiv, path, userId = null, displayName = null){
  // Create a random ID to use as our user ID (we must give this to firepad and FirepadUserList).  
  var userId = userId || Math.floor(Math.random() * 9999999999).toString();
  var firepadRef = firebase.database().ref(path);
  codeMirror = CodeMirror(firepadDiv, { 
    lineWrapping: false , lineNumbers: true , 
    mode: 'python'
  });

  firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
    { richTextToolbar: true, richTextShortcuts: true, userId: userId});

  //// Create FirepadUserList (with our desired userId).
  firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
    document.getElementById('userlist'), userId, displayName);
  
  firebase.auth().onAuthStateChanged(function(user){
    if (user){
      // firepad.setUserId(user.uid);
      // $("input.firepad-userlist-name-input").val(user.displayName).trigger('change');
      // console.log("Firepad: User Logged In")
    } else {
      // console.log("no user",user);
    }
  })
  return firepad;
}

function initializeFirepad_clear(path,clear_button){
  clear_button.addEventListener("click", 
    function() {
      var text = firepad.getHtml();
      // console.log('started clearing action');
      firebase.database().ref(path).child('history').set({});
      firepad.setText("");
      // console.log('completed clearing action (2)');
    });
}

function initializeFirepad_download (download_button,download_textbox,download_ext) {
  var textFile = null
  var makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
  };

  download_button.addEventListener('click', function () {
    var dt = new Date();
    var utcDate = dt.toISOString();
    var defaultString = "burning_notes_file_" + utcDate;

    // Download the file
    var link = document.createElement("a");
    link.download = (download_textbox.value == '' ? defaultString : download_textbox.value ) + download_ext.value;
    link.href = makeTextFile(firepad.getText());
    link.click();
  }, false);
};

function initializeFirepad_saveVersion (firepad,path,notepad_name,save_button,save_name) {
  save_button.addEventListener('click', function () {
    var utcDate = new Date().toISOString();
    var filename = save_name.value +"_"+ notepad_name +"_" + utcDate + ".html";
    var blob = new Blob([firepad.getHtml()], {type: 'text/plain'});;
    var locationRef = firebase.database().ref(path).child("versions");
    var storageRef = firebase.storage().ref().child("notepad_versions/"+filename);
    storageRef.put(blob).then(function(snapshot){
      var data = {};
      data[locationRef.push().key] = {filename : filename, uid: firebase.auth().currentUser.uid};
      locationRef.update(data);
      console.log("Successfully saved version "+filename);
    });
  }, false);
};

function initializeFirepad_loadVersion (firepad,path,notepad_name,load_list,load_button) {
  var locationRef = firebase.database().ref(path).child("versions");

  var updateCheckpointList = function(data){
    var datalist = []
    for (var version in data){
      datalist.push(data[version]['filename']);
      console.log(data[version]['filename']);

    }
    datalist.sort(function(a,b){ 
      var x = a.split("_").pop(), y = b.split("_").pop()
      return ( ( x == y ) ? 0 : ( ( x < y ) ? 1 : -1 ) ) });
    load_list.innerHTML = "";
    for (item in datalist){
      load_list.innerHTML += (`<div class="input-group">
            <div class="input-group-prepend">
              <div class="input-group-text">
                <input type="radio" name="loadList" value="${datalist[item]}">
              </div>
            </div>
            <p class="form-control text-truncate">${datalist[item]}</p>
          </div>`);
    }
  }
  locationRef.on("value",function(snapshot){
    var data = snapshot.val();
    updateCheckpointList(Object.values(data));
  });
  
  load_button.addEventListener('click', function () {
    var utcDate = new Date().toISOString();
    var filename = $("input[name='loadList']:checked").val();
    var storageRef = firebase.storage().ref("notepad_versions/").child(filename);

    storageRef.getDownloadURL().then(function(url) {
      // `url` is the download URL for the html file

      // This can be downloaded directly:
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function(event) {
        var blob = xhr.response;
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
          // reader.result contains the contents of blob as a string text
          firepad.setHtml(reader.result);
          console.log("Successfully loaded version "+filename);
        });
        reader.readAsText(blob);
      };
      xhr.open('GET', url);
      xhr.send();
    }).catch(function(error) {
      // Handle any errors
    });
  }, false);
};

// AUTHENTICATION
var provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;

    document.getElementById("FirebaseUsername").textContent = displayName;
    document.getElementById("FirebaseProfilePic").src = photoURL;

    $(".firebase-signed-in").css("visibility", "visible");
    $(".firebase-signed-out").css("display", "none");
    $("#checkpointSaveButton").removeClass("disabled");
    $("#checkpointLoadButton").removeClass("disabled");
  } else {
    $(".firebase-signed-in").css("visibility", "hidden");
    $(".firebase-signed-out").css("display", "block");
    // User is signed out.
    // ...
    document.location.reload();
  }
});

function signIn(){
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
    document.location.reload();
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}
function signOut(){
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}
// END AUTHENTICATION
