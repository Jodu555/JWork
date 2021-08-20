class App {
    constructor(element, views) {
        this.element = element;
        this.views = views;
        return this;
    }

    setRouter(router) {
        this.router = router;
    }

    init() {
        // this.views.forEach(view => {
        //     view.initFromApp();
        // });
        this.handleRouting();
        window.addEventListener('hashchange', (event) => {
            this.handleRouting();
        });
    }

    handleRouting() {
        this.element.innerHTML = '';
        const hash = location.hash.substr(1);
        let fallback = null;
        Object.entries(this.router).forEach(([key, value]) => {
            const route = value.route;
            fallback = route == '/' ? key : fallback;
            if (route == hash) {
                this.currentView = this.getViewByName(key);
                this.initView(this.currentView)
            }
        });
        if (this.currentView == undefined) {
            let view = this.getViewByName(fallback);
            this.initView(view);
            this.currentView = view;
        }
        console.log('CURR', this.currentView);
        console.log('FALLBACK:', fallback);
    }

    initView(view) {
        view.initFromApp(this.element, this);
    }

    getViewByName(name) {
        let ret;
        this.views.forEach((view) => {
            if (view.name == name) {
                ret = view;
            }
        });
        return ret;
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