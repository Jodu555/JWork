// const app = new App(document.querySelector('#app'), {
//     page: 'home',
//     history: [],
//     historyString: '/'
// }, (app) => {
//     //Must use passed variable cause the original app variable is not defined
//     app.variables.historyString = app.variables.page;
// });

// app.defineChnageWrapper('page', (prev, curr) => {
//     app.variables.history.push(prev);
// });

// app.defineChnageWrapper('history', (prev, curr) => {
//     app.variables.historyString = app.variables.history.reduce((acc, curr) => {
//         return acc += curr + ' / ';
//     }, '') + app.variables.page;
// });

// app.on('update', () => {

// });

// app.defineFunction('handleForm', (event, data) => {
//     console.log(event, data);
// });

// app.defineFunction('changePage', (event, page) => {
//     app.variables.page = page;
// });

// app.defineFunction('clearHistory', (event, page) => {
//     app.variables.history = [];
// });

// // app.defineComponent('about', 'another.html'); //One Component from file name is setted
// app.defineComponents('another.html'); // More than one Component from file name dynamically loads
import { App } from './jwork/App.js';
import { view as profileView } from './profile.js';
import { view as errorView } from './404.js';

const app = new App(document.querySelector('#app'), [
    profileView,
    errorView
]);
//If no default provided the / route is default view
app.setRouter({
    default: '404',
    'profileView': {
        route: '/',
    },
    '404': {
        route: '/404/:code'
    }
});

app.init();