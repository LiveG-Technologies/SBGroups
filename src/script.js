var currentUid = null;

function change(user) {
    if (user && user.uid != currentUid) {
        window.location.href = "user/index.html";
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    // Checks if user auth state has changed.
    change(user);
});