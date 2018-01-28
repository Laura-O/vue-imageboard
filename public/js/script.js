(function() {
    Vue.component('modal', {
        data: function() {
            return {
                comments: '',
            };
        },
        props: ['image'],
        template: '#modal-template',
        watch: {
            image: function(val) {
                axios.get('/comments/' + this.image.id).then(resp => {
                    this.comments = resp.data;
                });
            },
        },
        mounted: function() {
            console.log('image when mounted: ', this.image);
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
        props: ['id', 'comments'],
        template: '#comment-form-template',
        methods: {
            saveComment: function(e) {
                axios
                    .post('/comment', {
                        comment: this.comment,
                        user: this.commentUsername,
                        id: this.id,
                    })
                    .then(response => {
                        if (response.data.success == true) {
                            this.comments.unshift({
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
            selectedId: location.hash.slice(1),
            currentPage: 1,
            imagesPerPage: 6,
        },
        mounted: function() {
            if (window.location.hash) {
                this.getImage(window.location.hash.substring(1));
            }
            axios.get('/db').then(function(resp) {
                app.images = resp.data;
            });
        },
        computed: {
            totalPages: function() {
                return Math.ceil(this.images.length / this.imagesPerPage);
            },
            paginate: function() {
                // catch empty array & gaps
                if (!this.images || this.images.length != this.images.length) {
                    return;
                }
                let index = this.currentPage * this.imagesPerPage - this.imagesPerPage;
                return this.images.slice(index, index + this.imagesPerPage);
            },
        },
        watch: {
            selectedId: function(val) {
                this.getImage(val);
            },
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
                formData.append('username', this.formStuff.user);

                this.formStuff.title = '';
                this.formStuff.file = '';
                this.formStuff.description = '';
                this.formStuff.user = '';

                axios.post('/upload-image', formData).then(response => {
                    if (response.data.success == true) {
                        console.log(response);
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
            getImage(id) {
                axios.get('/image/' + id).then(resp => {
                    this.selectImage(resp.data[0]);
                });
            },
            deselect() {
                this.selectedImage = undefined;
                this.showModal = false;
            },
            setPage: function(pageNumber) {
                this.currentPage = pageNumber;
            },
        },
    });

    window.addEventListener('hashchange', function() {
        if (location.hash.slice(1)) {
            app.selectedId = location.hash.slice(1);
            console.log(app.selectedId);
        }
    });
})();
