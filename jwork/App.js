class App {
    constructor(element, views) {
        this.element = element;
        this.views = views;
        views.forEach(view => {
            console.log('APP: ', this);
            view.init(element, this);
        });
        return this;
    }
    getViewPart() {
        const template = document.createElement('div');
        template.setAttribute('data-load-component', 'index')
        this.element.appendChild(template);
        return template;
    }

}

export {
    App
}