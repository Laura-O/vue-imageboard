(function() {
    Vue.component('modal', {
        props: ['image', 'comments'],
        template: '#modal-template',
        mounted: function() {
            axios.get('/comments/' + this.image.id).then(resp => {
                this.comments = resp.data;
                console.log('comments after get', comments);
            });
        },
    });

    Vue.component('single-image', {
        props: ['path', 'title'],
        template: '#single-image-template',
    });

    Vue.component('comments', {
        template: '#comments-template',
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
                this.$parent.$parent.saveComment(
                    this.comment,
                    this.commentUsername,
                    this.$parent.image.id,
                );
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
                    console.log(response);
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
                        console.log(response);
                    });
            },
        },
    });
})();
