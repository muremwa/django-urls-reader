
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