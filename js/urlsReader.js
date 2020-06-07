/* 
Takes a urls.py and reads all urls
shall do the exact same thing as ../python/urls_reader.py
*/


function typeProcessor(arg) {
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


function urlProcessor(string, app_name) {
    /* 
    Takes a string of path() and returns
    a list like so -> ['app_name:url_name', (arguments,), 'view_name']
    */

    if (string.includes('_ROOT')) {
        return [];
    }


};