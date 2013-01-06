var EventSponge = require("./EventSponge").EventSponge;


function compose(f, g){
 //like mathematical function composition
 // compose(f, g)(x) = f(g(x))
 function composition(){
  var intermediate = g.apply(this, arguments);
  return f(intermediate);
 }
 //I hate un-debuggable closures
 //if I handed you a function like the above, without the lines below, you wouldn't be able to do anything but call it
 //it's nice to be able to crack it open and look at things like the f and g variables
 //but they're only defined in this scope, so you can't ask about them outside of this scope, even if you have a function that uses them
 //that function gets their scope, but having that function doesn't let you read its scope
 //so I like to do the following
 composition.f = f;
 composition.g = g;
 //that way for some f, compose(f, g).f === f
 // and for some g, compose(f, g).g === g
 //which can make debugging easier, especially if you have lots of functions that all came from calls to compose
 return composition;
}

this.compose = compose;

function FunctionImageStream(stream, fn){
 this.fn = fn;
 this.emitter = new EventSponge();
 stream.on(
  "data",
  function handleChunk(){
   try{
    this.emitter.emit("data", this.fn.apply(this, arguments));
   }
   catch(e){
    this.emitter.emit("error", e);
   }
  }.bind(this)
 ).on(
     "end",
     this.emitter.emit.bind(this.emitter, "end")
 );
}
FunctionImageStream.prototype.on = function on(){
 this.emitter.on.apply(this.emitter, arguments);
 return this;
};
FunctionImageStream.prototype.pause = function pause(){
 this.emitter.pause.apply(this.emitter, arguments);
 return this;
};
FunctionImageStream.prototype.resume = function resume(){
 this.emitter.resume.apply(this.emitter, arguments);
 return this;
};

this.FunctionImageStream = FunctionImageStream;