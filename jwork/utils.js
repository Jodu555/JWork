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

function removeEventListenersFromElement(element) {
    // console.log(element);
    // const elementClone = element.cloneNode(true);
    // element.parentNode.replaceChild(elementClone, element);
}

export {
    formDataToObject,
    removeVariables,
    stripOutVariables,
    concatWithVariables,
    clone,
    createElementFromHTML,
    createElementsFromHTML,
    removeEventListenersFromElement
};