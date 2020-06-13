// For the main layout
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

function getAsElement(element) {
  return ("string" == typeof element) ? document.getElementById(element) : element;
}

function getJSONObject(path) {
  return fetch(path).then(function(resp){return resp.json()}).then(function(json){return json});
}

class BurningNotes {
  constructor(config) {
    this.app = firebase.initializeApp(config);
    this.firepad = null;
    this.firepadRef = null;
    this.codeMirror = null;
    this.firepadUserList = null;
    this.provider = new firebase.auth.GoogleAuthProvider();
    this.initAuthorization();
  }

  initAuthorization() {
    
    this.app.auth().onAuthStateChanged(function(user) {
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
        // document.location.reload();
      }
    });
  }

  signIn() {
    this.app.auth().signInWithPopup(this.provider).then(function(result) {
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

  signOut() {
    this.app.auth().signOut().then(function() {
      // Sign-out successful.
    }).catch(function(error) {
      // An error happened.
    });
  }

  setFirepadRef(notepadName) {
    if (notepadName == null){
      return;
    }
    this.firepadRef = this.app.database().ref('/notepads/'+notepadName);
  }
  
  initCodeMirror(firepadContainer) {
    var _firepadContainer = getAsElement(firepadContainer);
    this.codeMirror = CodeMirror(_firepadContainer, { 
      lineWrapping: false, lineNumbers: true, 
      mode: 'python'
    });
  }

  initFirepad(firepadContainer, userlistId, notepadName = null, userId = null, displayName = null) {
    this.disposeFirepad();

    this.initCodeMirror(firepadContainer);
    this.setFirepadRef(notepadName);
    var userId = userId || Math.floor(Math.random() * 9999999999).toString();
    this.firepad = Firepad.fromCodeMirror(this.firepadRef, this.codeMirror,
      { richTextToolbar: true, richTextShortcuts: true, userId: userId });
    
    // Create FirepadUserList (with our desired userId).
    this.firepadUserList = FirepadUserList.fromDiv(this.firepadRef.child('users'),
      document.getElementById(userlistId), userId, displayName);
    this.app.auth().onAuthStateChanged(function(user){
      if (user){
        // firepad.setUserId(user.uid);
        // $("input.firepad-userlist-name-input").val(user.displayName).trigger('change');
        // console.log("Firepad: User Logged In")
      } else {
        // console.log("no user",user);
      }
    });
  }

  disposeFirepad() {
    if (this.firepad != null)
      this.firepad.dispose();
    if (this.firepadUserList != null)
      this.firepadUserList.dispose();
    if (this.codeMirror != null)
      this.codeMirror.getWrapperElement().parentElement.removeChild(this.codeMirror.getWrapperElement())
  }

  initClearTextButton(clearButton) {
    let _clearButton = getAsElement(clearButton);
    let obj = this;
    _clearButton.addEventListener("click",
    function(){obj.clearText();} 
    );
  }

  clearText() {
    var text = this.firepad.getHtml();
    // console.log('started clearing action');
    this.firepad.setText("");
    this.firepadRef.child('checkpoint').set({});
    this.firepadRef.child('history').set({});
    this.firepad.setText(" ");
    // console.log('completed clearing action (2)');
  }

  initDownloadFileButton(downloadButton, textbox, extension) {
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

  var _downloadButton = getAsElement(downloadButton);
  var _textbox = getAsElement(textbox);
  var _extension = getAsElement(extension);
  var obj = this;
  _downloadButton.addEventListener('click', function() {
    var dt = new Date();
    var utcDate = dt.toISOString();
    var defaultString = "burning_notes_file_" + utcDate;

    // Download the file
    var link = document.createElement("a");
    link.download = (_textbox.value == '' ? defaultString : _textbox.value ) + _extension.value;
    link.href = makeTextFile(obj.firepad.getText());
    link.click();
  }, false);
  }

  initLoadTextButton(loadList,loadButton) {
    var _loadList = getAsElement(loadList);
    var _loadButton = getAsElement(loadButton);
    var obj = this;

    var locationRef = this.app.database().ref('/notepad-versions');
  
    var updateCheckpointList = function(data){
      var datalist = []
      for (var version in data){
        var versionName = data[version]['title'] + "_" + data[version]['hash'];
        var filename = data[version]['filename'];
        datalist.push({filename:filename, versionName:versionName});
        console.log(versionName + " -> " + filename);
      }
      // datalist.sort(function(a,b){ 
      //   var x = a.split("_").pop(), y = b.split("_").pop()
      //   return ( ( x == y ) ? 0 : ( ( x < y ) ? 1 : -1 ) ) });
      datalist.sort();
      _loadList.innerHTML = "";
      for (let item in datalist){
        _loadList.innerHTML += (`<div class="input-group">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <input type="radio" name="loadList" value="${datalist[item].filename}">
                </div>
              </div>
              <p class="form-control text-truncate">${datalist[item].versionName}</p>
            </div>`);
      }
    }
    locationRef.on("value",function(snapshot){
      var data = snapshot.val();
      if (data != null)
        updateCheckpointList(Object.values(data));
    });
    
    _loadButton.addEventListener('click', function () {
      var utcDate = new Date().toISOString();
      var filename = $("input[name='loadList']:checked").val();
      var storageRef = obj.app.storage().ref("notepad_versions/").child(filename);
  
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
            obj.firepad.setText(reader.result);
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
  }
  
  initSaveTextButton(notepadName,saveButton,saveNameBox) {
    let _saveNameBox = getAsElement(saveNameBox);
    let _saveButton = getAsElement(saveButton);
    let obj = this;

    _saveButton.addEventListener('click', function () {
      var textContent = obj.firepad.getText();
      
      var date = new Date().toISOString();
      var hash = CryptoJS.SHA256(textContent).toString().slice(-7);
      var saveName = _saveNameBox.value;
      
      var filename = saveName +"_"+ notepadName +"_" + hash + ".txt";
      var blob = new Blob([textContent], {type: 'text/plain'});
      var locationRef = obj.app.database().ref('/notepad-versions');
      var storageRef = obj.app.storage().ref().child("notepad_versions/"+filename);
      storageRef.put(blob).then(function(snapshot){
        var data = {};
        data[locationRef.push().key] = {
          filename : filename,
          uid: obj.app.auth().currentUser.uid,
          title: saveName,
          hash: hash,
          date: date
        };
        locationRef.update(data);
        console.log("Successfully saved version "+filename);
      });
    }, false);
  }
}