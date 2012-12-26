var EventEmitter = require("events").EventEmitter;

function SlicingStream(stream, offset){
 //discard the first offset bytes of the stream
 this.emitter = new EventEmitter();
 this.remaining = offset;
 stream.on("data", this.handleChunk.bind(this)).on("end", this.emitter.emit.bind(this.emitter, "end"));
}
SlicingStream.prototype.handleChunk = function(chunk){
 var remaining = this.remaining;
 this.remaining -= chunk.length;
 if(remaining > chunk.length) return;
 this.emitter.emit("data", chunk.slice(remaining));
 this.remaining = 0;
}
SlicingStream.prototype.on = function on(){
 this.emitter.on.apply(this.emitter, arguments);
 return this;
}

this.SlicingStream = SlicingStream;