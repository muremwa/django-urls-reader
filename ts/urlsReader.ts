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