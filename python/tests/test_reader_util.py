import unittest

from python import reader_util


class MyTestCase(unittest.TestCase):
    def test_bracket_reader(self):
        example_text_1 = """
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
        example_text_2 = """
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
                        path('genre/<genre_name>/',views.GenrePage.as_view(),name="genre"),

                    ]

                """
        example_text_1_result = [
            "(r'^$', views.post_list, name='post_list')",
            "(r'^post/(?P<pk>\d+)/$', views.post_detail, name='post_detail')",
            "(r'^post/new/$', views.post_new, name='post_new')",
            "(r'^post/(?P<pk>\d+)/edit/$', views.post_edit, name='post_edit')",
            "(r'^post/(?P<pk>\d+)/edit/$', views.post_edit)"
        ]
        example_text_2_result = [
            "('', views.MusicIndex.as_view(), name=\"index\")",
            "('album/<slug:slug>/', views.AlbumPage.as_view(), name=\"album\")",
            "('artist/<slug:slug>/', views.ArtistPage.as_view(), name=\"artist\")",
            "('genre/<genre_name>/',views.GenrePage.as_view(),name=\"genre\")",
        ]

        self.assertEqual(example_text_1_result, reader_util.bracket_reader(example_text_1, '('))
        self.assertEqual(example_text_2_result, reader_util.bracket_reader(example_text_2, '('))

        example_3 = "my_name['kimmy']was [animal]kim"

        self.assertEqual(["['kimmy']", "[animal]"], reader_util.bracket_reader(example_3, '['))
        self.assertRaises(ValueError, reader_util.bracket_reader, 'ma(kim', '(')


if __name__ == '__main__':
    unittest.main()
