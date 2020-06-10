# Django urls reader.

Prototyping a project for a _VS code_ extension to read urls from django projects.

## Usage
All functions in `python/urls_reader.py`, `python/reader_util.py`, `js/urlsReader.js`, `js/readerUtil.js` and `js/mainReader.js`.
> Hunagarian notation shows javascript functions. eg. urlsFinder is javascript.  
> Snake case shows python functions. eg. urls_finder is python.  
1. `urls_finder` or `urlsFinder`
Takes the text from a urls.py file and returns a dict with only one item.  
`'app_name': ['list of raw, unprocessed urls',]`

2. `url_processor` or `urlsProcessor`
Takes a raw, unprocessed url and cleans it to return a list with the reverse name, 
the arguments taken by the url and their type and the view name responsible.  
`'app_name': ['app_name:url_name', ([argument_1, type_as_string],...), view]`  
`urlProcessor` returns arguments as an array of arrays, unlike `url_processor` that 
returns a tuple of lists/arrays.  
Some patterns are ignored like a redirect or static or media url. `urlsProcessor` does not
ignore redirects.

3. `walk_project` or `walkProject`
Takes a path presumed to be the root of a django project and finds all `../urls.py` files. 
It returns a list of paths. It assumes the root shall contain `manage.py` file otherwise it throws 
an `NotDjangoProject` exception(defined in the same file).  
`walkProject` goes ahead and searches for a folder with `manage.py` and assumes it's the project root. If none is found,
it throws an `Error`.  

4. `main`  
Combines all this logic on a whole project. It takes the root path as it's argument.

### Examples
1. `urls_finder` or `urlsFinder`  
Argument supplied:
```text
from django.urls import path

from . import views


app_name = "music"

urlpatterns = [

    # music/
    path('', views.MusicIndex.as_view(), name="index"),

    # music/album/divide/
    path('album/<slug:slug>/', views.AlbumPage.as_view(), name="album"),

    # /music/artist/ed-sheraan-1/
    path('artist/<slug:slug>/', views.ArtistPage.as_view(), name="artist"),

    # /music/genre/r&b/
    path('genre/<genre_name>/', views.GenrePage.as_view(), name="genre"),

]
``` 

It would return

```text
{
    'music': (
        "path('', views.MusicIndex.as_view(), name=\"index\")",
        "path('album/<slug:slug>/', views.AlbumPage.as_view(), name=\"album\")",
        "path('artist/<slug:slug>/', views.ArtistPage.as_view(), name=\"artist\")",
        "path('genre/<genre_name>/', views.GenrePage.as_view(), name=\"genre\")",
    )
}
```

2. `url_processor` or `urlProcessor`  
Arguement supplied: 
```text
{
    'tweet': (
        "url(r'^(?P<pk>\d+)/edit/$', TweetUpdate.as_view(), name='update')",
        "url(r'^search/$', TweetListSkeleton.as_view(), name='search')",
        "url(r'^$', RedirectView.as_view(url='/'))",
        "path('hostel/<slug:slug>/<room_number>/now/', views.RoomBooking.as_view(), name='now')"
    ),
}
```

It would return
```text
{
    'tweet': (
        ['tweet:update', (['pk', None],), 'TweetUpdate.as_view()'],
        ['tweet:search', (), 'TweetListSkeleton.as_view()'],
        [],
        ['tweet:now', (['slug', 'slug'], ['room_number', None]), 'views.RoomBooking.as_view()']
    ),
}
```