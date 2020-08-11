
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
    found urls by urlsFinder
*/
export interface FoundUrls {
    appName: string
    urls: string[] | []
};

/* 
    urlConfig argument
*/
export interface UrlArgument {
    name: string | null
    argType: string | null
};

/* 
    callback to handle a project not being a django project
*/
export type NotProjectHandler = (isNotProject: boolean) => void;

/* 
    callback to handle a project not being a django project
*/
export type braceNotComplete = (braceType: string) => void;

/* 
    returned by mainReader
*/
export interface MultipleAppUrls extends Map<string, ProcessedUrl[]> {}