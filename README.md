
StackSlider
=========

An experimental image slider that flips through images in 3D. Two stacks resemble image piles where images will be lifted off from and rotated to the center for viewing.

[article on Codrops](http://tympanus.net/codrops/?p=12566)

[demo](http://tympanus.net/Development/StackSlider)

#### Options
The following default options are available:

```javascript
// default transition easing
easing : 'ease-in-out',

// is looping enabled
loop : false,

// render both piles
piles : true,

// default transition speed
speed : 600,

// default starting slide
start: 0,

// callbacks
onBeforeNavigate : $.noop,
onAfterNavigate : $.noop,
onBeforeFlow : $.noop,
onAfterFlow : $.noop,
```

Licensed under the MIT License
