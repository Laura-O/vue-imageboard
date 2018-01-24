(function() {
    Vue.component('modal', {
        data: function() {
            return {
                comments: '',
            };
        },
        props: ['image'],
        template: '#modal-template',
        mounted: function() {
            axios.get('/comments/' + this.image.id).then(resp => {
                this.comments = resp.data;
            });
        },
    });

    Vue.component('single-image', {
        props: ['path', 'title'],
        template: '#single-image-template',
    });

    Vue.component('comment', {
        props: ['name', 'comment'],
        template: '#comment-template',
    });

    Vue.component('comment-form', {
        data: function() {
            return {
                comment: '',
                commentUsername: '',
            };
        },
        template: '#comment-form-template',
        methods: {
            saveComment: function(e) {
                axios
                    .post('/comment', {
                        comment: this.comment,
                        user: this.commentUsername,
                        id: this.$parent.image.id,
                    })
                    .then(response => {
                        if (response.data.success == true) {
                            this.$parent.comments.unshift({
                                comment: response.data.comment,
                                username: response.data.username,
                                id: response.data.imageId,
                            });
                        }
                    });
            },
        },
    });

    var app = new Vue({
        el: '#main',
        data: {
            images: '',
            formStuff: {
                title: '',
                description: '',
            },
            showModal: false,
            selectedImage: undefined,
        },
        mounted: function() {
            axios.get('/db').then(function(resp) {
                app.images = resp.data;
                console.log(app.images);
            });
        },
        methods: {
            chooseFile: function(e) {
                this.formStuff.file = e.target.files[0];
            },
            uploadFile: function(e) {
                e.preventDefault();

                const formData = new FormData();
                formData.append('file', this.formStuff.file);
                formData.append('title', this.formStuff.title);
                formData.append('description', this.formStuff.description);
                formData.append('username', this.formStuff.username);

                axios.post('/upload-image', formData).then(response => {
                    if (response.data.success == true) {
                        app.images.unshift({
                            description: response.data.description,
                            image: response.data.filename,
                            title: response.data.title,
                            username: response.data.username,
                        });
                    }
                });
            },
            selectImage(image) {
                this.selectedImage = image;
                this.showModal = true;
            },
            deselect() {
                this.selectedImage = undefined;
                this.showModal = false;
            },
            saveComment(comment, commentUsername, imageId) {
                axios
                    .post('/comment', { comment: comment, user: commentUsername, id: imageId })
                    .then(response => {
                        if (response.data.success == true) {
                            // comments.unshift({
                            //     description: response.data.comment,
                            //     username: response.data.username,
                            //     id: response.data.imageId,
                            // });
                        }
                    });
            },
        },
    });
})();
