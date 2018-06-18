Dropzone.options.dropzoneUpload = {
    autoProcessQueue: false,
    url: "/file/post",
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 2, // MB
    maxFiles: 1,
    acceptedFiles: '.docx,.odt',
    //addRemoveLinks: true,
    previewTemplate: document.querySelector('#template-container').innerHTML,
    init: function() {
        dropzoneInstance = this;
        dropzoneInstance.on("maxfilesexceeded", function(file) {
            this.removeAllFiles();
            this.addFile(file);
        });
        dropzoneInstance.on("addedfile", function(file) { alert("Added file."); });
        dropzoneInstance.on("sending", function(file, xhr, formData) {
            formData.append("email", document.getElementById("email"));
            formData.append("monospace", document.getElementById("monospace"));
            for (var key of formData.keys()) {
                console.log(key);
            }
        });
        $('.yo').on('click', function() {
            dropzoneInstance.processQueue();
        });
    },
    accept: function(file, done) {
        done();
    }
};