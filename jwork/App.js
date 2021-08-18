class App {
    constructor(element, views) {
        this.element = element;
        this.views = views;
        views.forEach(view => {
            view.initFromApp(element, this);
        });
        return this;
    }
    generateViewPart() {
        const template = document.createElement('div');
        template.setAttribute('data-load-component', 'index')
        this.element.appendChild(template);
        return template;
    }

}

export {
    App
}