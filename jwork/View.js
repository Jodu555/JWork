import {
    formDataToObject,
    removeVariables,
    stripOutVariables,
    concatWithVariables,
    clone,
    createElementFromHTML,
    createElementsFromHTML,
    removeEventListenersFromElement
} from './utils.js';

class View {
    constructor(name, variables, onCreate) {
        this.name = name;
        if (!variables) {
            variables = {};
        }
        this.prevariables = { ...variables };
        this.variables = variables;
        this.functions = new Map();
        this.changeWrappers = new Map();
        this.eventfunctions = new Map();
        this.components = new Map();
        this.needupdate = false;
        this.defaultCycleTime = 10;
        this.initial = true;
        this.interval = null;
        if (onCreate)
            this.eventfunctions.set('create', onCreate(this));
        return this;
    }

    initFromApp(element, app) {
        this.element = element;
        this.app = app;
        this.app.generateViewPart();
        this.init();
        this.update();
    }

    init(with_interval = true) {


        this.initCallElements();
        this.element.querySelectorAll('[data-define-component]').forEach(element => {
            this.components.set(element.getAttribute("data-define-component"), element);
        });

        if (!with_interval)
            return;
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            if (document.hidden)
                return;
            if (this.needupdate) {
                this.needupdate = false;
                this.update();
            }
            let change = true;
            //Cloned here beacue probably in a wrapper some variables changed
            let curr = clone(this.variables);
            // console.log(JSON.stringify(this.prevariables), JSON.stringify(this.variables));
            if (JSON.stringify(this.prevariables) !== JSON.stringify(curr)) {
                Object.keys(curr).forEach(key => {
                    if (curr[key] !== this.prevariables[key] && this.changeWrappers.get(key)) {
                        change = this.changeWrappers.get(key)(clone(this.prevariables[key]), clone(curr[key]));
                    }
                });
                if (change || change == undefined) {
                    this.update();
                    this.prevariables = clone(curr);
                } else {
                    this.variables = clone(this.prevariables);
                }
            }
        }, 10);

        this.call('create');
    }

    call(event) {
        if (this.eventfunctions.get(event.toLowerCase()))
            this.eventfunctions.get(event.toLowerCase())();
    }

    initCallElements() {
        //Remove All Other Listeners
        this.element.querySelectorAll('[data-call]').forEach(element => {
            element.replaceWith(element.cloneNode(true));
        });
        //Append All Listeners back
        this.element.querySelectorAll('[data-call]').forEach(element => {
            const target = element.getAttribute("data-call");
            const tagname = element.tagName.toLowerCase();
            if (tagname == 'form') {
                element.addEventListener('submit', (event) => {
                    event.preventDefault();
                    this.functions.get(target.replace('()', ''))(event, formDataToObject(new FormData(element)));
                });
                return;
            }
            if (target.includes('(')) {
                const passedVariables = target.split('(')[1].replace(')', '').split(', ').map(passedVariable => passedVariable.substring(1).slice(0, -1));
                element.addEventListener('click', (event) => this.functions.get(target.split('(')[0])(event, ...passedVariables));
            } else {
                element.addEventListener('click', (event) => this.functions.get(target)(event));
            }
        });
    }

    update() {
        // console.log('UPDATE');
        // console.time('update');
        this.call('update');

        [...this.element.querySelectorAll('[data-kill]')].filter(e => e.getAttribute("data-kill") == 'true').forEach(e => e.remove());

        this.element.querySelectorAll('[data-load-component]').forEach(element => {
            try {
                let target = element.getAttribute("data-load-component");
                if (target == 'index' && !this.initial) {
                    return;
                }
                if (stripOutVariables(target).length !== 0) {
                    target = this.variables[stripOutVariables(target)[0]];
                }
                let template = this.components.get(target)
                typeof template == 'string' ? template = createElementFromHTML(template) : template = template;
                element.innerHTML = template.innerHTML;
                this.init(false);
                if (this.target == 'index')
                    this.initial = false;
            } catch (error) {
                this.needupdate = true;
            }
        });

        this.element.querySelectorAll('a').forEach(element => {
            element.setAttribute('href', '#' + element.getAttribute("href"));
        });

        this.initCallElements();
        this.updateDataBindElements();


        this.updateDataForElements();
        this.updateDataIfElements();
        this.updateVarContainsElements();

        // console.timeEnd('update');
    }

    updateDataBindElements() {
        this.element.querySelectorAll('[data-bind]').forEach(element => {
            const target = element.getAttribute("data-bind");
            if (element.tagName.toLowerCase() !== 'input') {
                element.innerText = this.variables[target];
                return;
            }
            element.addEventListener('input', (event) => {
                this.variables[target] = event.target.value;
            });
        });
    }

    updateVarContainsElements() {
        this.element.querySelectorAll('*').forEach(element => {
            if (element.innerText.includes('${{') && element.children.length == 0) {
                const clone = element.cloneNode(true);
                element.after(clone);
                clone.innerText = concatWithVariables(clone.innerText, this.variables);
                clone.setAttribute('data-kill', true);
                clone.style.display = '';
                clone.removeAttribute('data-varaiable');

                element.style.display = 'none';
                element.setAttribute('data-varaiable', true);
            }
        });
    }

    updateDataForElements() {
        this.element.querySelectorAll('[data-for]').forEach(element => {
            const target = element.getAttribute("data-for");
            const split = target.split(' in ');
            this.variables[split[1]].forEach(item => {
                const clone = element.cloneNode(true);
                clone.innerText = clone.innerText.replace(`{{${split[0]}}}`, item);
                clone.style.display = '';
                clone.removeAttribute('data-for');
                clone.setAttribute('data-kill', true);
                element.after(clone);
            });
            element.style.display = 'none';
        });
    }

    updateDataIfElements() {
        this.element.querySelectorAll('[data-if]').forEach(element => {
            const target = element.getAttribute("data-if");
            let show = true;
            if (target.includes('==')) {
                show = this.variables[target.split(' == ')[0]] == target.split(' == ')[1];
            } else {
                let negated = target.startsWith('!');
                target.replace('!', '');
                show = negated ? !this.variables[target] : this.variables[target];
            }
            element.style.display = show ? '' : 'none';
        });
    }

    setHTMLFile(file) {
        this.defineComponent('index', file);
    }

    //key = create | update |
    on(key, fun) {
        if (key == 'create' || key == 'update') {
            this.eventfunctions.set(key.toLowerCase(), fun);
        } else {
            console.error('Event: ' + key + ' is not supported yet! Please remove it from your application!');
        }
    }

    //Defines
    defineChnageWrapper(key, fun) {
        this.changeWrappers.set(key, fun);
    }
    defineFunction(name, fun) {
        this.functions.set(name, fun);
    }
    async defineComponent(name, file) {
        const response = await fetch(file);
        const text = await response.text();
        this.components.set(name, text);
    }
    async defineComponents(file) {
        const response = await fetch(file);
        const text = await response.text();
        createElementsFromHTML(text).forEach(element => {
            if (element.getAttribute('[data-define-component') !== undefined)
                this.components.set(element.getAttribute("data-define-component"), element);
        });
    }
}

export { View };