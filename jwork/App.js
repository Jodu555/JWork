class App {
    constructor(element, views) {
        this.element = element;
        this.views = views;
        views.forEach(view => {
            view.element = element;
            view.init();
        });
        return this;
    }

}

export {
    App
}