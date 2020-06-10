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



function bracketReader (stringToRead, braceToRead) {
    /* 
    get to know where a bracket starts and is successfully closed
    */
    if ([stringToRead, braceToRead].some(arg => arg === undefined)) {
        throw TypeError('one of the arguments is undefined');
    }

    if (typeof stringToRead !== 'string' || typeof braceToRead !== 'string') {
        throw TypeError('String to read is not a string');
    }

    const braces = {'{': '}', '[': ']', '(': ')'};
    const partnerBrace = braces[braceToRead];

    if (partnerBrace === undefined) {
        throw TypeError(`${braceToRead} is not supported`);
    }

    const bracePositions = [];
    const stringToReadAsList = [...stringToRead];
    let position = 0;

    const getItemIdex = function (item, index) {
        if (index >= position) {
            if (item === braceToRead) {
                return true;
            }
        }
    };


            // a brace can only be closed if we are beyond index 'start'
            if (index > start) {
                if (strand === braceToRead) {
                    // if it's anothe opening brace increment openingBraceCount
                    openingBraceCount++;
                } else if (strand === partnerBrace) {
                    // if its a closing brace then decrement openingBraceCount
                    openingBraceCount--;
                };
            };
            // when opening_brace_count is 0, it means that an opened bracket is
            // now closed and there's no need to proceed with the loop
            // create an new position to find a new opening brace
            if (openingBraceCount == 0) {
                endPosition = +index;
                position = +index;
                break;
            };
        };

        // if it does not close raise a value error
        if (openingBraceCount) {
            throw Error(`No closing brace found!`);
        };

        // add the brace to brace positions [start, end_position] => [[start, end_position]]
        bracePositions.push([start, endPosition]);

        // check if there's a new brace?
        start = stringToReadAsList.findIndex((item, index) => getItemIdex(item, index));
    };

    // return a list of substrings of string with an open and corresponding closing brace
    return bracePositions.map(
        bracePos => stringToRead.substring(bracePos[0], bracePos[1] + 1).replace('\n', '')
    );
};