import { ProcessedUrl } from "./reader";

const pathConvertes = new Map(
    [
        ['slug', 'slug'],
        ['int', 'integer'],
        ['str', 'string'],
        ['uuid', 'UUID'],
        ['path', 'path']
    ]
);


const NO_TYPE = 'NULL';


function typeProcessor(arg: string): [string, string] {
    /* 
    if the type of an argument is defined map it correctly
    'str:name' -> 🏭 -> ['name', 'string']
    */
    let procesedType: [string, string] = ['', ''];

    const argList = arg.split(":");

    if (argList.length === 2) {
        const argType = pathConvertes.has(argList[0])? pathConvertes.get(argList[0]): NO_TYPE;
        procesedType = [argType!, argList[1]]
    } else if (argList.length === 1) {
        procesedType = [NO_TYPE, argList[0]]
    };

    return procesedType;
};


function urlProcessor(urlString: string, appName: string): ProcessedUrl | null {
    /* 
        Takes a string of path() and returns an object like ProcessedUrl
        extracts the view_name, url reverse name and all arguments from the url
         -> 
        {
            reverseName: 'reverse:name',
            arguments: [
                ['arg', 'argType'] | []
            ],
            viewName: 'viewName',
            hasArgs: true | false?
        }

        if no name exists null is returned
        if _ROOT is in urlString then null is returned
    */

    if (urlString.includes('_ROOT')) {
        return null;
    };

    let name: string | null = null;
    let viewArg: string | null = null;
    let urlArgs: string[][] | [] = [];
    let possibleNames: RegExpMatchArray | null;
    let possibleViews: RegExpMatchArray | null;
    // reg ex for url name
    const namePattern = /\bname=[\'\"](.*?)[\'\"]/;
    // reg ex for a view that has a name
    const viewPattern = /[\'\"],[\s\t\n]*(.+?),/;
    // reg ex for url argument
    const argsPattern = /<.*?>/g;

    // extract names
    possibleNames = urlString.match(namePattern);
    if (possibleNames) {
        // the non global pattern returns an array in which the requested group is at index 1
        name = possibleNames[1].replace(' ', '');
    } else {
        // if no name exists then stop processing the url! :-(
        return null;
    };

    // extract view name
    possibleViews = urlString.match(viewPattern);
    if (possibleViews) {
        // the group we targeted is at index 1
        viewArg = possibleViews[1];
    };

    // extract arguments and process them
    let args = urlString.match(argsPattern);
    if (args && args.length > 0) {
        urlArgs = args.map((arg: string): [string, string] => typeProcessor(arg.replace('<', '').replace('>', '')));
    };
    
    // create the view name
    const reverseName = appName.includes('READER_FILE_PATH_')? name: `${appName}:${name}`;

    return {
        reverseName,
        arguments: urlArgs,
        viewName: viewArg,
        hasArgs: urlArgs.length > 0
    };
};