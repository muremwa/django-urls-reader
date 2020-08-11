import { join } from 'path';
import { readFileSync } from 'fs';

import { walkSync, WalkOptions, WalkStatArrayEventCallback, WalkOptionsListeners } from 'walk';

import { NotProjectHandler, ProcessedUrl, MultipleAppUrls } from './reader';
import { urlsFinder, urlProcessor } from './urlsReader'


function realProjectWalk (realProjectPath: string, filtersOptions: WalkOptions): string[] {
    /* 
        get the project root of a django project and find all urls.py files
        The arg options contains filters for WalkOptions
    */

    let urlPys: string[] = [];

    // function to check if a file is urls.py and add it to urlPys
    const pyChecker: WalkStatArrayEventCallback = (root, fileStats, next) => {
        const urlsPyFiles = fileStats.filter((fileStat) => fileStat.name === 'urls.py').map((fileStat) => join(root, fileStat.name));
        urlPys = urlPys.concat(urlsPyFiles);
        next();
    };

    // errors?
    const errorManager: WalkStatArrayEventCallback = (_, __, next) => next();

    // listeners to pass to walkSync
    const listeners: WalkOptionsListeners = {
        files: pyChecker,
        errors: errorManager
    };

    // all options combined
    const optionsWithFilters: WalkOptions = Object.assign(filtersOptions, {listeners});

    // let's walk!
    walkSync(realProjectPath, optionsWithFilters);

    return urlPys;
};


function walkProject (projectSourcePath: string, notDjangoProjectHandler: NotProjectHandler): string[] {
    /* 
        find the folder with 'manage.py' (which shall be treated as the root dir) and pass it to realProjectWalk
        walk the dir and record all files that are urls.py 
        return a list of them
    */
    const filters = [
        '.idea','.vscode', '.git', '__pycache__', 'templates', 'tests', 'media', 'static', 'migrations', 'node_modules', 'venv'
    ];
    let urls: string[] = [];

    // function to look for manage.py
    const manageDotPyFinder: WalkStatArrayEventCallback = (root, fileStats, next) => {
        const manageDotPy = fileStats.find((fileStat) => fileStat.name === 'manage.py');

        // if manage.py is not found (is undefined) go to next
        if (manageDotPy === undefined) {
            next();
        } else {
            notProject = false
            urls = realProjectWalk(join(root), {filters});
        };
    };

    // errors?
    const errorManager: WalkStatArrayEventCallback = (_, __, next) => next();

    // what happens when you walk the dir and no manage.py file is found? raise error? let a callback handle it?
    let notProject = true;
    const end: WalkStatArrayEventCallback = () => {
        notDjangoProjectHandler(notProject);
    };

    // find manage.py
    const options: WalkOptions = {
        filters,
        listeners: {
            files: manageDotPyFinder,
            errors: errorManager,
            end
        }
    };

    walkSync(projectSourcePath, options);

    return urls;
};


export function mainReader (path: string, notDjangoProjectHandler?: NotProjectHandler): MultipleAppUrls {
    /* 
        path is a project path 
        read all urls and return a Map with the following items
        Map([
            ['appName', [
                {
                    reverseName: 'string',
                    arguments: [
                        {
                            name: 'string',
                            type: 'string'
                        },...
                    ],
                    viewName: 'string',
                    hasArgs: boolean
                },...
            ]...]
        ])
    */
    const readUrls: MultipleAppUrls = new Map<string, ProcessedUrl[]>();

    const notPCallBack: NotProjectHandler = notDjangoProjectHandler? notDjangoProjectHandler: (notProject) => {
        if (notProject) {
            throw new Error('This is not a django project');
        };
    };
    
    // get urls.py
    const urlConfFiles = walkProject(path, notPCallBack);

    // loop through all url config files and extract all urls and process them
    for (const urlDotPy of urlConfFiles) {
        const urlDotPyText = readFileSync(urlDotPy, {encoding: 'utf-8', flag: 'r'});
        const dirtyUrls = urlsFinder(urlDotPyText, urlDotPy);

        if (dirtyUrls.urls.length > 0) {
            const processedUrls = [...dirtyUrls.urls].map((url) => urlProcessor(url, dirtyUrls.appName)!).filter((url) => url !== null);
            if (processedUrls.length > 0) {
                readUrls.set(dirtyUrls.appName, processedUrls);
            };
        };
        
    };

    return readUrls;
};