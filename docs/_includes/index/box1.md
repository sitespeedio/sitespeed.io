{% for post in site.posts limit:1 %}
## {{ post.title }}
* * *

{{ post.intro }}
[Read the blog post to find out more]({{site.baseurl}}{{ post.url }}).
{% endfor %}
