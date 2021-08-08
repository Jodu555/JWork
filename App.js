class App {
    constructor(element, variables, onCreate, autoInit = true,) {
        this.element = element;
        this.prevariables = { ...variables };
        this.variables = variables;
        this.functions = new Map();
        this.changeWrappers = new Map();
        this.eventfunctions = new Map();
        this.components = new Map();
        this.needupdate = false;
        this.defaultCycleTime = 10;
        this.eventfunctions.set('create', onCreate(this));
        if (autoInit)
            this.init();
        return this;
    }

    init() {

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
        this.element.querySelectorAll('[data-define-component]').forEach(element => {
            this.components.set(element.getAttribute("data-define-component"), element);
        });

        setInterval(() => {
            if (document.hidden)
                return;
            if (this.needupdate) {
                this.needupdate = !this.needupdate;
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
        this.update();
    }

    call(event) {
        if (this.eventfunctions.get(event.toLowerCase()))
            this.eventfunctions.get(event.toLowerCase())();
    }

    update() {
        // console.time('update');
        this.call('update');

        [...this.element.querySelectorAll('[data-kill]')].filter(e => e.getAttribute("data-kill") == 'true').forEach(e => e.remove());

        this.element.querySelectorAll('[data-load-component]').forEach(element => {
            try {
                let target = element.getAttribute("data-load-component");
                if (stripOutVariables(target).length !== 0) {
                    target = this.variables[stripOutVariables(target)[0]];
                }
                let template = this.components.get(target)
                typeof template == 'string' ? template = createElementFromHTML(template) : template = template;
                element.innerHTML = template.innerHTML;
            } catch (error) {
                // console.error(error);
                this.needupdate = true;
            }
        });

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

        this.element.querySelectorAll('*').forEach(element => {
            if (element.innerText.includes('${{')) {
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

        // console.timeEnd('update');
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

function formDataToObject(formData) {
    const obj = {};
    for (var key of formData.keys()) {
        obj[key] = formData.get(key);
    }
    return obj;
}

function removeVariables(str) {
    const array = stripOutVariables(str);
    array.forEach(element => {
        str = str.replace('${{' + element + '}}', '');
    });
    return str;
}

function stripOutVariables(str) {
    const array = str.split('${{');
    array.shift();
    const variables = array.filter(e => e !== '').map(element => element.split('}}')[0].replace(',', ''));
    return variables;
}

function concatWithVariables(str, variables) {
    stripOutVariables(str).forEach(vari => str = str.replace('${{' + vari + '}}', variables[vari]));
    return str;
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function createElementsFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return [...div.children];
}