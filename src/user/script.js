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