import { View } from './jwork/View.js';
const view = new View('404');

view.defineFunction('testFunCall', () => {
    console.log('Called test FunCall');
});

view.setHTMLFile('404.html');
export { view };