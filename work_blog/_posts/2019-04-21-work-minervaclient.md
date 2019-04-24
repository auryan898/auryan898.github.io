---
layout: workpost
title: "Minervaclient: Course Registration API"
date: 2019-04-21
image-link: '/img/work-minervaclient.png'
link: https://github.com/minervaclient/minervaclient
iframe: https://minervaclientdemo.ryanau.repl.run/
---

This project aims to create an API for McGill's course registration website using **web scraping tools** written in Python. The tools offered by Minervaclient, course registration, course lookup, schedule creation, and transcript access are all mostly supported (still very buggy) and more features such as a comprehensive GUI, schedule recommendations, and course prereq/coreq information still in development.  

McGill University's course registration website, Minerva, lacks certain functionality and ease of use that students could benefit from.  Its course registration system is spread out amongst multiple pages, and information about such courses are spread amongst entirely different websites.  This API aims to scrape all of the information from those websites, access those multiple pages of registration and put all of these features into one place.


<hr>
Here is a working demo of Minervaclient as a command shell.  A quick example to run is `search -term FALL2019 Math-133 --lecture-only`.

<iframe src="https://minervaclientdemo.ryanau.repl.run/"></iframe>

<style>
section {
    float:left;
}
iframe {
    width:inherit;
    height:500px;
}
</style>
