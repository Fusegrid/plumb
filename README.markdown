Plumb
=====

Plumb is a tool for composing web layouts that figures out HTML and CSS from shapes you draw, using a vertical grid system. See example.html for demo.


Status
------

Plumb is targeting an imaginary version of CSS in which dimensions can be specified by expressions like "50% - 200px". This can be faked in some browsers by using wrapper elements and negative margins (see the "stretchiness" dir for a few experiments) but I don't currently have a complete generalization of this technique ready to handle any layout. I am aware of the technique of using table CSS and IE's support for expressions in CSS, but these solutions aren't ideal. For one thing, table CSS can't represent the full range of layouts Plumb can recognize.

So, for now, Plumb is mainly an experiment and an interface.