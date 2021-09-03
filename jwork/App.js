import {
    matchEndpoint
} from './utils.js';

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
        if (this.router) {
            this.handleRouting();
            window.addEventListener('hashchange', (event) => {
                this.handleRouting();
            });
        }
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
            const matcher = matchEndpoint(hash, route);
            if (matcher.match) {
                this.currentView = this.getViewByName(key);
                this.initView(this.currentView)

                this.currentView.variables.$router = matcher.variables;
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

    getCookieManager() {
        return {
            setCookie: (cname, cvalue, exdays) => {
                const d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                const expires = "expires=" + d.toUTCString();
                document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            },
            getCookie: (cname) => {
                const name = cname + "=";
                const decodedCookie = decodeURIComponent(document.cookie);
                const ca = decodedCookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            },
            deleteCookie: (cname) => {
                this.getCookieManager.setCookie(cname, -1, -1);
            }
        }
    }

}

export {
    App
}