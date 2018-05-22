var $result = $("#result");
var jString = "";
var finalZip = new JSZip();

function setMD5Vars(object, key) {
    function search(obj) {
        if (!obj || typeof obj !== "object") {
            return;
        }

        if (key in obj) {
            reference = obj;
            console.log(reference);
            console.log(key);
            console.log(reference[key][1][2].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
            
            // Hierachy differs here due to the way Scratch 3.0 works!
            if (key == "BROADCAST_INPUT" || key == "MESSAGE") {
                jString = jString.replace(new RegExp(reference[key][1][2].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "g"), CryptoJS.MD5(reference[key][1][1]).toString());
            } else {
                jString = jString.replace(new RegExp(reference[key][1].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "g"), CryptoJS.MD5(reference[key][0]).toString());
            }
            reference[key][1][2] = CryptoJS.MD5(reference[key][1][1]).toString();
            console.log(reference[key][1][2]);
        }

        Object.keys(obj).some(function(item) {
            return search(obj[item]);
        });
    }

    search(object);
}

function prepareZip() {
    var header = `{"targets":[{"isStage":true,"name":"Stage","variables":{},"lists":{},"broadcasts":{},"blocks":{},"currentCostume":0,"costumes":[{"assetId":"739b5e2a2435f6e1ec2993791b423146","name":"backdrop1","bitmapResolution":1,"md5ext":"739b5e2a2435f6e1ec2993791b423146.png","dataFormat":"png","rotationCenterX":240,"rotationCenterY":180}],"sounds":[{"assetId":"83a9787d4cb6f3b7632b4ddfebf74367","name":"pop","dataFormat":"wav","format":"","rate":48000,"sampleCount":1123,"md5ext":"83a9787d4cb6f3b7632b4ddfebf74367.wav"}],"volume":100,"tempo":60,"videoTransparency":50,"videoState":"off"},`;
    var footer = `],"meta":{"semver":"3.0.0","vm":"0.1.0-prerelease.1526052228","agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"}}`;
    
    setMD5Vars(JSON.parse("[" + jString + "]"), "BROADCAST_INPUT");
    setMD5Vars(JSON.parse("[" + jString + "]"), "BROADCAST_OPTION");
    setMD5Vars(JSON.parse("[" + jString + "]"), "MESSAGE");
    setMD5Vars(JSON.parse("[" + jString + "]"), "VARIABLE");
    setMD5Vars(JSON.parse("[" + jString + "]"), "LIST");

    finalZip.file("project.json", header + jString + footer);
    finalZip.generateAsync({type: "blob"}).then(function(data) {
        saveAs(data, "myProject.sb3");
    })
}

$("#file").on("change", function(evt) {
    $result.html("");
    $("#result_block").removeClass("hidden").addClass("show");

    function handleFile(file) {
        var $title = $("<h4>", {
            text: file.name
        });

        var $fileContent = $("<ul>");
        $result.append($title);
        $result.append($fileContent);

        var dateBefore = new Date();

        JSZip.loadAsync(file).then(function(zip) {
            var dateAfter = new Date();
            $title.append($("<span>", {
                class: "small",
                text: " (loaded in " + (dateAfter - dateBefore) + "ms)"
            }));

            zip.forEach(function (relativePath, zipEntry) {
                if (zipEntry.name == "project.json") {
                    zipEntry.async("text").then(function(data) {
                        for (i = 0; i < JSON.parse(data).targets.length; i++) {
                            if (!JSON.parse(data).targets[i].isStage) {
                                $fileContent.append($("<li>", {
                                    text: JSON.stringify(JSON.parse(data).targets[i])
                                })).css("font-family", "monospace");

                                if (jString.length == 0) {
                                    jString += JSON.stringify(JSON.parse(data).targets[i]);
                                } else {
                                    jString += ", " + JSON.stringify(JSON.parse(data).targets[i]);
                                }
                            }
                        }
                    });
                } else {
                    $fileContent.append($("<li>", {
                        text: zipEntry.name
                    }));

                    zipEntry.async("base64").then(function(data) {
                        var reader = new FileReader();

                        finalZip.file(zipEntry.name, data, {base64: true});
                    });
                }
            });
        }, function (e) {
            $result.append($("<div>", {
                "class": "alert alert-danger",
                text: "Error reading " + file.name + ": " + e.message
            }));
        });
    }

    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
        handleFile(files[i]);
    }
});