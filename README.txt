Plumb
=====

http://code.google.com/p/plumb/

Plumb is a tool for composing layouts that figures out HTML and CSS from shapes you draw, using a (vertical) grid system inspired by the Blueprint CSS framework.

Currently, Plumb generates Blueprint-style HTML marked up with classes and accompanying CSS, or slightly more semantic HTML with ids and CSS to match. Plumb supports layouts that require nested containers and figures out how much space to prepend and append elements with.


Compatibility
-------------

Plumb has been tested in Firefox 2 and Safari 2.0.4. The generated layouts should work in every browser Blueprint supports.


Getting started with Plumb
--------------------------

Open index.html in your browser. You'll see the vertical grid, some tools at the top left, a text box at the top right, and some settings for your grid below the grid.

Click and drag on the grid with the shape tool (the rectangle) to make shapes. Shapes are automatically given IDs. You can give a shape a custom ID by selecting it and typing in the text box at the top right.

Plumb works a lot like a regular drawing program. You can drag shapes around and resize them using their handles, you can remove a shape by selecting it and pressing backspace or delete, and you can select multiple shapes and drag them all around at once.

To generate your layout, click on one of the buttons below the grid settings. "Generate layout with ids" uses the IDs you give your shapes, and "generate with classes" uses the Blueprint-style span-x and friends.


Limitations
-----------

There are some types of layouts Plumb can't recognize, but it will warn you if it knows it can't recognize something. (If you get an infinite loop or other weird behaviour, please submit a ticket.) For example, this layout is known to be unsupported, and Plumb will warn you if you try to generate code for it:

  |-a-|     |------b-----|
  |---|     
  |---|              |-c-|
  |---|              |---|
                     |---|
  |------d------|    |---|

Also, the meaning of the height and vertical position of elements is more fluid than horizontal position and width, unless it causes shapes to be grouped differently. For example, the following examples will all generate the same output:

  |-a-|         |--c--|
  |---|         |-----|
                |-----|
         |-b-|  |-----|
         |---|  |-----|

  ---------------------
  
         |-b-|  |--c--|
         |---|  |-----|
                |-----|
  |-a-|         |-----|
  |---|         |-----|
            
  ---------------------
  
  |-a-|  |-b-|  |--c--|
  |---|  |---|  |-----|
  |---|  |---|  |-----|
  |---|  |---|  |-----|
  |---|  |---|  |-----|

This is because that big rectangle to the right groups everything into one row, and then from there things are grouped into columns, and then Plumb stops grouping. This may change in the future, and I trust you to edit the code that Plumb generates if you want something it doesn't do!

So if you take the big rectangle away, those are NOT equivalent: (provided that in the first two cases the shapes don't overlap vertically)

  |-a-|       
  |---|       
              
         |-b-|
         |---|
              
  ------------
              
         |-b-|
         |---|
              
  |-a-|       
  |---|       
              
  ------------
              
  |-a-|  |-b-|
  |---|  |---|
  |---|  |---|
  |---|  |---|
  |---|  |---|