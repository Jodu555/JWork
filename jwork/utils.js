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

function matchEndpoint(path, match) {
    var pattern = match.split("/");
    var output = false;
    let variables = {};
    try {
        let i = 0;
        path.split('/').forEach((string) => {
            if (string == pattern[i] || pattern[i + 1] == string || pattern[i].startsWith(':') || pattern[i].startsWith(':?')) {
                if (pattern[i].startsWith(':') && !pattern[i].startsWith(':?')) {
                    const variable = pattern[i].replace(':', '').replaceAll('', '');
                    variables[variable] = string;
                } else if (pattern[i].startsWith(':?')) {
                    const variable = pattern[i].replace(':?', '').replaceAll('', '');
                    if (pattern[i + 1] == string) {
                        //Optional Vairbale not present
                    } else {
                        variables[variable] = string;
                    }
                }
                output = true;
            } else {
                output = false;
            }
            i++;
        });
    } catch (error) {
        output = false;
    }
    return { match: output, variables };
}

export {
    formDataToObject,
    removeVariables,
    stripOutVariables,
    concatWithVariables,
    clone,
    createElementFromHTML,
    createElementsFromHTML,
    matchEndpoint
};