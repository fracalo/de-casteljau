Being functional in a mutable context.

While playing with the De Casteljau demonstration I was in the situation of repeatedly needing to update some SVG elements,
if you don't know the De Casteljau algorithm just keep in mind that each inner control segment element depends on the outer element
so it comes quite natural to deal with computations with a [pipeline](http://ramdajs.com/docs/#pipe).
The functional artisan in me would just flush the state and redraw everything,
and that would work perfectly if we were drawing on the canvas but we're not...
since we're dealing with svg there would be a performance hit to add and remove elements from the dom like an epileptic attack,
so once our elements are drawn we need to find a way to keep a reference to them without redrawing them.

As a solution to this problem I came up with a pattern that while generating the lines would also bind the created elements to the computing functions,
the computing functions have an element-reference arguments if this is specified the element will just be updated and not redrawn.
once the control lines are created we get back a function with signature like `t: Number -> outerSegments:[LineElement] -> pipe -> Point`.
The consists of funcit
this will be used to the binded elements (side effect) and returns the interpolation point on the curve.

This feels a little bit unnatural because we're modifying the elements through side effects but It looks like a good compromise (at least the best one I can think about)
