/* 
Takes a urls.py and reads all urls
shall do the exact same thing as ../python/urls_reader.py
*/


function typeProcessor(arg) {
    if (!arg) {
        return []
    }
    const types = {slug: 'slug', int: 'integer', str: 'string'};
    let argList = arg.split(":");

    if (argList.length == 2) {
        let argType = types[argList[0]];

        // if argType is undefined the use null
        argType = argType === undefined? null: argType;

        // add the type to the front of the list
        argList[0] = argType;

    } else {
        // add null to the front of the array
        argList.splice(0, 0, null);
    }

    return argList.reverse();

};


function urlProcessor(string, appName) {
    /* 
    Takes a string of path() and returns
    a list like so -> ['appName:url_name', (arguments,), 'view_name']
    */
    if ([string, appName].some(arg => arg === undefined)) {
        throw TypeError("all arguments not satisfied");
    }    

    if ((typeof string !== 'string') || (typeof appName !== 'string')) {
        throw TypeError("wrong argument type: all arguments should be strings");
    }

    if (string.includes('_ROOT')) {
        return [];
    }

    let name = null;
    let view = null;
    let possibleNames;
    let possibleViews;
    const namePattern = /[\s,]name=[\'\"](.*?)[\'\"].*?\)$/;
    const viewPattern = /[\'\"],[\s\t\n]*(.+?),/;
    const viewPatternNoName = /[\'\"],[\s\t\n]*(.+?)\)$/;
    const argsPattern = /<.*?>/g;

    // extract names
    possibleNames = string.match(namePattern);
    if (possibleNames) {
        // the non global pattern returns an array in which the requested 
        // group is at index 1
        name = possibleNames[1];
    }

    // extract view
    // if no name exists then choose the NoName pattern
    possibleViews = string.match(
        name === null? viewPatternNoName: viewPattern
    );
    if (possibleViews) {
        view = possibleViews[1];
    }


    // extract arguments and process them
    let args = string.match(argsPattern);
    args = args? args.map(
        arg => typeProcessor(arg.replace('>', '').replace('<', ''))
    ): [null];
    

    // create the view name
    let viewName = null;
    viewName = function () {
        if (name) {
            if (appName.includes("READER_FILE_PATH_")) {
                return `${name}`;
            } else {
                return `${appName}:${name}`;
            }
        } else {
            return null;
        }
    }();

    return [viewName, args, view];
};

