import unittest
import urls_reader


class MyTestCase(unittest.TestCase):
    def test_urls_finder(self):
        example_file_1 = """
            from django.conf.urls import url
            from . import views
            
            urlpatterns = [
                # /
                url(r'^$', views.post_list, name='post_list'),
                
                # /post/34/
                url(r'^post/(?P<pk>\d+)/$', views.post_detail, name='post_detail'),
                
                # post/new/
                url(r'^post/new/$', views.post_new, name='post_new'),
                
                # post/34/edit/
                url(r'^post/(?P<pk>\d+)/edit/$', views.post_edit, name='post_edit'),
                
                # post/34/edit/
                url(r'^post/(?P<pk>\d+)/edit/$', views.post_edit),
                
            ]
        """
        example_file_2 = """
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

        """
        example_file_1_result = {
            'no_app_name': (
                "url(r'^$', views.post_list, name='post_list')",
                "url(r'^post/(?P<pk>\d+)/$', views.post_detail, name='post_detail')",
                "url(r'^post/new/$', views.post_new, name='post_new')",
                "url(r'^post/(?P<pk>\d+)/edit/$', views.post_edit, name='post_edit')",
                "url(r'^post/(?P<pk>\d+)/edit/$', views.post_edit)"
            )
        }
        example_file_2_result = {
            'music': (
                "path('', views.MusicIndex.as_view(), name=\"index\")",
                "path('album/<slug:slug>/', views.AlbumPage.as_view(), name=\"album\")",
                "path('artist/<slug:slug>/', views.ArtistPage.as_view(), name=\"artist\")",
                "path('genre/<genre_name>/', views.GenrePage.as_view(), name=\"genre\")",
            )
        }

        self.assertEqual(example_file_1_result, urls_reader.urls_finder(example_file_1))
        self.assertEqual(example_file_2_result, urls_reader.urls_finder(example_file_2))

    def test_type_processor(self):
        self.assertEqual(urls_reader.type_processor("slug:slug"), ["slug", "slug"])
        self.assertEqual(urls_reader.type_processor('int:pk'), ['pk', 'integer'])
        self.assertEqual(urls_reader.type_processor('name'), ['name', None])

    def test_url_processor(self):
        examples = {
            'tweet': (
                "url(r'^(?P<pk>\d+)/edit/$', TweetUpdate.as_view(), name='update')",
                "url(r'^search/$', TweetListSkeleton.as_view(), name='search')",
                "url(r'^$', RedirectView.as_view(url='/'))",
                "path('hostel/<slug:slug>/<room_number>/now/', views.RoomBooking.as_view(), name='now')"
            ),
            'api': (
                "url(r'^create/$', TweetCreateAPIView.as_view(), name='create')",
                "url(r'^(?P<username>[\w.@+-]+)/$', TweetListAPIView.as_view(), name='user-tweets')",
                "url(r'^create/$', TweetCreateAPIView.as_view())",
                "path('', KimView.as_view(), name='doja')"
            ),
            'no_app_name': (
                "url(r'^create/$', TweetCreateAPIView.as_view(), name='create')",
                "re_path('^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT})"
            )
        }

        results = {
            'tweet': (
                ['tweet:update', (['pk', None],), 'TweetUpdate.as_view()'],
                ['tweet:search', (), 'TweetListSkeleton.as_view()'],
                [],
                ['tweet:now', (['slug', 'slug'], ['room_number', None]), 'views.RoomBooking.as_view()']
            ),
            'api': (
                ['api:create', (), 'TweetCreateAPIView.as_view()'],
                ['api:user-tweets', (['username', None],), 'TweetListAPIView.as_view()'],
                [None, (), 'TweetCreateAPIView.as_view()'],
                ['api:doja', (), 'KimView.as_view()'],
            ),
            'no_app_name': (
                ['create', (), 'TweetCreateAPIView.as_view()'],
                [],
            )
        }

        outcome = {}

        for app_name, urls in examples.items():
            response = []
            for url in urls:
                response.append(
                    urls_reader.url_processor(url, app_name)
                )
            outcome[app_name] = tuple(response)

        self.assertEqual(results, outcome)


if __name__ == '__main__':
    unittest.main()
