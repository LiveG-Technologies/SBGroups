var currentUid = null;

function dataURItoBlob(dataURI) {
    // Convert base64 to raw binary data held in a string.
    // Doesn't handle URLEncoded DataURIs.
    var byteString = atob(dataURI.split(",")[1]);

    // Separate out the mime component.
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]

    // Write the bytes of the string to an ArrayBuffer.
    var ab = new ArrayBuffer(byteString.length);

    // Create a view into the buffer.
    var ia = new Uint8Array(ab);

    // Set the bytes of the buffer to the correct values.
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // Write the ArrayBuffer to a blob, and you're done.
    var blob = new Blob([ab], {type: mimeString});
    return blob;
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function change(user) {
    if (user && user.uid != null) {
        // Signed in.
        // firebase.database().ref("users/" + user.uid + "/_settings/name").on("value", function(snapshot) {
        //     if (getURLParameter("test") != "true") {
        //         $(".myname").text(snapshot.val());
        //     }
        // });
    } else {
        // Signed out.
        if (getURLParameter("test") != "true") {
            window.location.href = "../signin.html";
        }
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    // Checks if user auth state has changed.
    if (user) {currentUid = user.uid;} else {currentUid = null;}

    change(user);
});

function signOut() {
    firebase.auth().signOut();
}

function uploadPpic(data) {
    var file = dataURItoBlob(data);
    storageRef.child("users/" + currentUid + "/_settings/ppic.png").put(file).then(function(snapshot) {
    console.log('Uploaded a blob or file!');
    });
}

$("#ppicFile").on("change", function(evt) {
    function handleFile(file) {
        console.log(file);
        var fileData = new FileReader()
        fileData.readAsDataURL(file);
        fileData.onload = function(evt) {
            console.log(evt.target.result);
            uploadPpic(evt.target.result);
        }
    }

    var files = evt.target.files;
    console.log(files);
    handleFile(files[0]);
});