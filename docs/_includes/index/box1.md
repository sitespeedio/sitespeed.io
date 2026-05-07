{% for post in collections.posts limit:1 %}
## {{ post.data.title }}
* * *

{{ post.data.intro }}
[Read the blog post to find out more]({{ site.baseurl }}{{ post.url }}).
{% endfor %}
