---
layout: workpost
title: "3D Modeling: Solids of Known Volume for Calculus"
date: 2019-05-30
image-link: '/img/work-calculus-solids.png'
link: https://github.com/auryan898/calculus-solids
iframe: https://calculus-solids2--ryanau.repl.co/
---

This terrible looking app is a quickly put-together tool for teachers and students in Calculus classes around the world to visually render solids of known volume into an editable 3D format.  Sites on the internet sometimes serve up an interactive demo of the formulas and fancy animations, but this tool is simple and concise.  It will take the appropriate inputs for your solid, then output basic STL formats, create a 3D plot of the points for you, and it even outputs to OpenJsCAD and OpenSCAD for further extensibility and remixing.  Not only useful for education, but great for those 3D designers that want to use a solid of revolution in their day to day designs.

Have fun.


<hr>
Here is a working demo of the Calculus Solids interface.  
A simple example to run uses "solid of revolution"
- lower limit: -3
- upper limit: 3
- precision: 0.1
- offset: 0 (only applicable for solids of revolution)
- lower function: 0
- upper function: math.sqrt(9-x**2)

functions take the form of any math expression based in Python

<iframe src="https://calculus-solids2--ryanau.repl.co/"></iframe>

<style>
section {
    float:left;
}
iframe {
    width:inherit;
    height:300px;
}
</style>