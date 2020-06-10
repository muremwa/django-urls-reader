"""
Takes a urls.py and reads all urls
"""
import re
import os
import operator
import functools


from python import reader_util


class NotDjangoProject(BaseException):
    """if the supplied path is not of a django project"""
    pass


def type_processor(arg: str) -> list:
    """ if the type of an argument is defined map it correctly """
    types = {'slug': 'slug', 'int': 'integer', 'str': 'string'}
    arg_list = [ar for ar in arg.split(':')]

    if len(arg_list) == 2:
        arg_list[0] = types.get(arg_list[0], None)

    else:
        arg_list.insert(0, None)

    arg_list.reverse()

    return arg_list


def url_processor(string: str, app_name: str) -> list:
    """Takes a string of path() and returns a list like so -> ['app_name:url_name', (arguments,), 'view_name'] """
    # ignore url for serving media and static files
    if '_ROOT' in string:
        return []

    view, name = None, None

    possible_names = re.findall(r'[\s,]name=[\'\"](.*?)[\'\"].*?\)$', string, re.M | re.DOTALL)

    if possible_names:
        name = possible_names[0]

    path_ending = '\)$'
    if name:
        path_ending = ','

    possible_views = re.findall(r'[\'\"],[\s\n\t]*(.*?){ending}'.format(ending=path_ending), string, re.M | re.DOTALL)

    if possible_views:
        view = possible_views[0]

    if view:
        if "Redirect" in view:
            return []

    args = tuple(
        type_processor(arg) for arg in re.findall(r'<(.*?)>', string)
    )

    view_name = None

    if "READER_FILE_PATH_" in app_name:
        view_name = f"{name}"
    else:
        if name:
            view_name = f"{app_name}:{name}"

    return [view_name, args, view]


def urls_finder(urls_file_text: str, file_path: str) -> dict:
    """ get a urls.py file text and extract 'app_name' and all urls """
    app_name = f"READER_FILE_PATH_{file_path}"

    app_names = re.findall(r'app_name.*?[\'\"](.*?)[\'\"]', urls_file_text, re.I | re.M | re.DOTALL)
    if app_names:
        app_name = ''.join([char for char in app_names[0] if char != ' '])

    # extract urls
    urlpatterns = reader_util.bracket_reader(urls_file_text, '[')
    urls = []
    for found in urlpatterns:
        urls.extend(reader_util.bracket_reader(found, '('))

    return {app_name: tuple(urls)}


def walk_project(home_path: str) -> list:
    """ walk a projects and record all files that are urls.py return a list of them """
    home = os.getcwd()
    os.chdir(home_path)
    files = os.listdir(os.getcwd())

    if 'manage.py' not in files:
        raise NotDjangoProject

    url_files = []

    for root, folders, files in os.walk(os.getcwd()):
        _ignore = {'.idea', '.vscode', '.git', '__pycache__', 'templates', 'tests', 'media', 'static', 'migrations'}
        ignorable = _ignore.intersection(set(folders))

        for folder in ignorable:
            folders.remove(folder)

        if 'urls.py' in files:
            url_files.append(os.path.join(root, 'urls.py'))

    os.chdir(home)

    return url_files


def main(path: str) -> dict:
    # scour a project and find all urls.py
    url_files = walk_project(path)

    urls = []

    # open them and retrieve the text
    for url_file in url_files:
        with open(url_file, 'r') as f:
            text = f.read()
            try:
                raw_urls = urls_finder(text, url_file)
            except ValueError:
                continue
            urls.append(raw_urls)

    urls = [list(item.items()) for item in urls]

    raw_urls = dict(
        functools.reduce(lambda item_1, item_2: operator.concat(item_1, item_2), urls)
    )

    clean_urls = {}

    for name, url_paths in raw_urls.items():
        clean_paths = []
        for path in url_paths:
            clean_paths.append(url_processor(path, name))
        clean_urls[name] = clean_paths

    return clean_urls
