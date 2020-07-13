
/* 
    result returned by urlProcessor after processing a url
*/
export interface ProcessedUrl {
    reverseName: string
    arguments: string[][] | []
    viewName: string | null
    hasArgs: boolean
};