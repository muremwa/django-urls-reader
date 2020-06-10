/* 
Look for urls.py and read all the urls paths declared
*/

const walk = require('walk');
const fs = require('fs');

function realProjectWalk (realProjectPath, options) {
    /* 
        get the files that are named urls.py
    */
    if (typeof realProjectPath !== 'string' || typeof options !== 'object') {
        throw TypeError('argument types incorrect');
    };

    const urlFiles = [];
    options = Object.assign(options, {
        listeners: {
            file: function (root, fileStats, next) {
                if (fileStats.name) {
                    // if it is a url.py file add the whole path to urlFiles
                    if (fileStats.name === 'urls.py') {
                        urlFiles.push(`${root}\\${fileStats.name}`);
                    };
                };
                next();
            },
            errors: function (root, stats, next) {
                next();
            }
        }
    });
    
    // get the files
    walk.walkSync(realProjectPath, options);

    return urlFiles;
};


function walkProject(projectSourcePath) {
    /* 
        walk a projects and record all files that are urls.py 
        return a list of them
    */
    if (typeof projectSourcePath !== 'string') {
        throw TypeError('projectSourcePath should be a string');
    };

    let urlFiles = [];
    let djangoProject = false;
    const options = {
        filters: [
            '.idea','.vscode', '.git', '__pycache__', 'templates', 'tests', 'media', 'static', 'migrations', 'node_modules'
        ],
        listeners: {
            file: function (root, fileStats, next) {
                // look for manage.py to signify the project root!
                
                if (fileStats.name) {
                    // look for the project root that exists on manage.py root!
                    if (fileStats.name === 'manage.py') {                
                        // get url.py (s) for real
                        djangoProject = true;
                        urlFiles = realProjectWalk(root, options);
                    } else {
                        next();
                    }
                }
            },
            end: function () {
                if (djangoProject === false) {
                    throw Error('This is not a django project');
                };
            },
            errors: function (root, stats, next) {
                next();
            }
        }
    };
    walk.walkSync(projectSourcePath, options);

    return urlFiles;
};