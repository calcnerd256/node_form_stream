var EventEmitter = require("events").EventEmitter;

function applyFrom(that, methodName, args){
 return that[methodName].apply(that, args);
}

function EventSponge(noBuffer){
 if(!noBuffer) this.pause();
 this.emitter = new EventEmitter();
}
EventSponge.prototype.emit = function emit(){
 if(!this.buffer)
  return applyFrom(this.emitter, "emit", arguments);
 this.buffer.push(arguments);
 return this;
};
EventSponge.prototype.on = function on(){
 applyFrom(this.emitter, "on", arguments);
 return this;
};
EventSponge.prototype.once = function once(){
 applyFrom(this.emitter, "once", arguments);
 return this;
}
EventSponge.prototype.pause = function pause(){
 if(!this.buffer) this.buffer = [];
 return this;
};
EventSponge.prototype.resume = function resume(){
 if(!this.buffer) return;
 this.buffer.map(
  Function.prototype.apply.bind(
   this.emitter.emit,
   this.emitter
  )
 );
 delete this.buffer;
 return this;
};

this.applyFrom = applyFrom;
this.EventSponge = EventSponge;