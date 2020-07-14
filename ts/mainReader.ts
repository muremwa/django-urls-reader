import { walkSync, WalkOptions, WalkStatArrayEventCallback, WalkOptionsListeners } from 'walk';
import { join } from 'path';


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