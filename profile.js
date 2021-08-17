import { View } from './jwork/View.js';
const view = new View('profileView', {
    page: 'home',
    history: [],
    historyString: '/'
}, (view) => {
    //Must use passed variable cause the original app variable is not defined
    view.variables.historyString = view.variables.page;
});

view.defineChnageWrapper('page', (prev, curr) => {
    view.variables.history.push(prev);
});

view.defineChnageWrapper('history', (prev, curr) => {
    view.variables.historyString = view.variables.history.reduce((acc, curr) => {
        return acc += curr + ' / ';
    }, '') + view.variables.page;
});

view.on('update', () => {

});

view.defineFunction('handleForm', (event, data) => {
    console.log(event, data);
});

view.defineFunction('changePage', (event, page) => {
    view.variables.page = page;
});

view.defineFunction('clearHistory', (event, page) => {
    view.variables.history = [];
});

// view.defineComponent('about', 'another.html'); //One Component from file name is setted
view.defineComponents('another.html'); // More than one Component from file name dynamically loads


export { view };