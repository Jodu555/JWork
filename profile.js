import { View } from './jwork/View.js';
const view = new View('profileView', {
    page: 'home',
    history: [],
    historyString: '/',
    testData: [{ name: 'asdf', age: 13 }, { name: 'asxsaf', age: 13 }],
}, (view) => {
    //Must use passed variable cause the original app variable is not defined
    view.variables.historyString = view.variables.page;
});

view.defineChangeWrapper('page', (prev, curr) => {
    view.variables.history.push(prev);
});

view.defineChangeWrapper('history', (prev, curr) => {
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
    view.variables.testData.push({ name: page, age: page.length })
});

view.defineFunction('clearHistory', (event, page) => {
    view.variables.history = [];
});

view.defineFunction('test', (event, name) => {
    console.log('sdfnsijodnjoisd: ' + name);
})

view.setHTMLFile('profile.html');
// view.defineComponent('about', 'another.html'); //One Component from file name is setted
view.defineComponents('another.html'); // More than one Component from file name dynamically loads


export { view };