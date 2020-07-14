
/* 
    result returned by urlProcessor after processing a url
*/
export interface ProcessedUrl {
    reverseName: string
    arguments: UrlArgument[] | []
    viewName: string | null
    hasArgs: boolean
};


/* 
    callback to handle a project not being a django project
*/
export type notProjectHandler = (isNotProject: boolean) => void;

/* 
    urlConfig argument
*/
export interface UrlArgument {
    name: string | null
    argType: string | null
};