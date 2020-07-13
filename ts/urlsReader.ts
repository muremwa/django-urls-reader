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


function typeProcessor(arg: string): string[] {
    /* 
    if the type of an argument is defined map it correctly
    'str:name' -> 🏭 -> ['name', 'string']
    */
    let argList = arg.split(":");

    if (argList.length == 2) {
        const argType = pathConvertes.has(argList[0])? pathConvertes.get(argList[0]): NO_TYPE;
    } else {
        // add null to the front of the array
        argList.unshift(NO_TYPE);
    };

    return argList.reverse();
};