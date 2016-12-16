Purely functional dom elements diffing
---

While playing with the De Casteljau demonstration I was in the situation of repeatedly needing to update some SVG elements,  

_if you don't know the De Casteljau algorithm just keep in mind that each inner control-segment element depends on the outer element;  
therefore it comes quite natural to deal with computations with a [pipeline](http://ramdajs.com/docs/#pipe)._  

The shortcutter in me was about to trash the state and redraw everything,  
drop SVG and go for Canvas, but since I wanted vector definition I went on...  

Dealing with svg there would be a performance hit to add and remove elements from the dom like an epileptic, so, once our elements were drawn, I needed to find a way to keep a reference to them.

As a solution to this problem I came up with a pattern:  
while generating the svg elements, these would also get binded to the computing functions;  
the computing functions have an element-reference arguments, if this is specified the element will just be updated, otherwise a new element will be created.


Once the initial elements are created we get back a function with signature like `t: Number -> outerSegments:[LineElement] -> pipe -> Point`;

The functions in the update pipe do the calculation though each level based on former ( controlPoints -> outerControlSegments -> midControlSegments -> innerControlSegments -> interpolationPoint);
the binded elements get updated immediately (side effect on the reference).

---

At first this felt a bit awkward:

 - modifying the locked in elements through side effects
 - passing through the elements to next stage for computations
 - and down to next level in the pipe


Being a customized animation we know exactly what will be the mutating attributes,
and aren't doing any diffing here.

_a little digression for better focus what comes next:  
With a virtual dom implementation like React you structure the app in a tree like structure,
but what happens if you have an element whose update depends on nodes that are not on the ascending tree path,
like in the above scenario?_

Could we add a recursive diff-stage in the updating function for generalizing this pattern?
 - eventually bail out if nothing is passed, otherwise pass the change to next stage.
 - drop the tree like structure and create a purely functional pipeline structure.

Could this be a useful pattern for updating state in browser apps?


I know you're frowning so I'll quit it here.  
Since there might be some potential here I'll probably go deeper on this...  
if somebody wants some code it's all on the github repo.

Any feedback or comments are appreciated.
