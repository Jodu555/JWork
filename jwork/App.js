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
        window.app = this;
        this.handleRouting();
        window.addEventListener('hashchange', (event) => {
            this.handleRouting();
        });
    }

    handleRouting() {
        this.currentView = null;
        this.element.innerHTML = '';
        const hash = location.hash.substr(1);
        let fallback = null;
        if (this.router.default) {
            fallback = this.router.default;
        }
        Object.entries(this.router).forEach(([key, value]) => {
            const route = value.route;
            if (!fallback)
                fallback = route == '/' ? key : fallback;
            if (route == hash) {
                this.currentView = this.getViewByName(key);
                this.initView(this.currentView)
            }
        });
        if (this.currentView == null) {
            console.log('Route does not exists trys Fallback');
            let view = this.getViewByName(fallback);
            if (view) {
                this.initView(view);
                this.currentView = view;
            } else {
                this.element.innerText = 'ERROR: Routing View not Found!';
            }
        }
        // console.log('CURR', this.currentView);
        // console.log('FALLBACK:', fallback);
    }

    satisfyRoute(route) {
        if (route.startsWith('.')) {
            if (route.charAt(1) !== '/') {
                route = this.satisfyRoute(route.substring(1))
            }
            route = location.hash.substr(1) + route;
        }
        if (!route.startsWith('/')) {
            route = '/' + route;
        }
        return route;
    }

    route(to) {
        to = this.satisfyRoute(to);
        window.location.hash = to;
        this.handleRouting();
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