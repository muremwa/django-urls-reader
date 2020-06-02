"""
Takes a urls.py and reads all urls
"""
import re
import os
import operator
import functools


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

    path_parts = string.split(",")

    pattern = path_parts[0]
    view = path_parts[1].strip(' ')
    name = None

    if "Redirect" in view:
        return []

    if view.count('(') != view.count(')'):
        temp_view = list(view)
        temp_view.remove(')')
        view = ''.join(temp_view)

    if len(path_parts) > 2:
        name = path_parts[2]


    if name:
        name = name.split("=")[-1]
        name = list(name)
        name = ''.join([s for s in name if s not in ['"', '\'', ')']])

    args = tuple(
        type_processor(arg.strip('<').strip('>')) for arg in re.findall(r'<.*?>', pattern)
    )

    view_name = None

    if app_name == "no_app_name":
        view_name = f"{name}"
    else:
        if name:
            view_name = f"{app_name}:{name}"

    return [view_name, args, view.strip(',')]


def urls_finder(urls_file_text: str) -> dict:
    """ get a urls.py file text and extract 'app_name' and all urls """
    app_name = 'no_app_name'
    app_names = re.findall(r'app_name.*?$', urls_file_text, re.I | re.M)
    if app_names:
        app_name = app_names[0].split("=")[-1]
        # ensure there are no spaces or " or '
        app_name = ''.join(
            [s for s in app_name if s not in ['\'', '"', ' ']]
        )

    # extract urls
    urls = []
    no_new_line_urls_file_text = urls_file_text.translate(str.maketrans('\n', '|'))
    urlpatterns = re.findall(r'urlpatterns.*?\]', no_new_line_urls_file_text)

    if urlpatterns:
        urlpatterns = re.findall(r'\[.*?\]', urlpatterns[0])

        if urlpatterns:
            urls = re.findall(r'[^#]\s(\w+\(.*?\)),\|', urlpatterns[0])

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
            raw_urls = urls_finder(text)
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
