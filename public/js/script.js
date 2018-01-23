(function() {
    Vue.component('modal', {
        props: ['image'],
        template: '#modal-template',
    });

    Vue.component('single-image', {
        props: ['path', 'title'],
        template: '#single-image-template',
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
        },
    });
})();
