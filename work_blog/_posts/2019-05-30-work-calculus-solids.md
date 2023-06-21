---
layout: workpost
title: "3D Modeling: Solids of Known Volume for Calculus"
date: 2019-05-30
image-link: '/img/work-calculus-solids.png'
link: https://github.com/auryan898/calculus-solids
iframe: https://calculus-solids2--ryanau.repl.co/
---


This web app is a simple tool to visually render solids of known volume into an editable 3D format. Intended for use by teachers and students in Calculus classes around the world to assist in their studies.  

Existing sites on the internet sometimes serve up an interactive demo of pre-defined formulas with fancy animations, but this tool is simple and concise. It will take the appropriate inputs for your solid, then output basic STL formats, create a 3D plot of the points for you, and it even outputs to OpenJsCAD and OpenSCAD for further extensibility and remixing.  Not only useful for education, but great for those 3D designers that want to use a solid of revolution in their day to day designs.

<p style="color:red;">NOTE: Live Demo is no longer functional for the time being.</p>

<a href="https://github.com/auryan898/calculus-solids" target="_blank">Link to the github project (to install locally)</a>  
<a href="https://repl.it/@RyanAu/Calculus-Solids2" target="_blank">Link to the repl.it project</a>  




<hr>
Here is a <s>working</s> demo of the Calculus Solids interface.  
A simple example to run uses "solid of revolution"
- lower limit: -3
- upper limit: 3
- precision: 0.1 (use ~0.5 for slower devices)
- offset: 0 (only applicable for solids of revolution)
- lower function: 0
- upper function: math.sqrt(9-x**2)

~~[Link to the Live Demo](https://calculus-solids2--ryanau.repl.co/)~~  


<iframe src="https://calculus-solids2--ryanau.repl.co/"></iframe>




<style>
section {
    float:left;
}
iframe {
    width:inherit;
    height:300px;
    overflow-y: scroll;
}
</style>
