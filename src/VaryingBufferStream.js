

function VaryingBufferStream(stream, measure){
 this.measure = measure;
 this.emitter = new EventEmitter();
 this.buffer = "";
 stream.on("data", this.handleChunk.bind(this)).on("end", this.end.bind(this));
}
VaryingBufferStream.prototype.handleChunk = function handleChunk(chunk){
 var i = this.measure(chunk, this.buffer);
 if(0 >= i) return this.buffer += chunk;
 this.emitter.emit("data", this.buffer + chunk.slice(0, i));
 this.buffer = chunk.slice(i);
};
VaryingBufferStream.prototype.end = function end(){
 if(this.buffer)
  this.emitter.emit("data", this.buffer);
 this.emitter.emit("end");
};
VaryingBufferStream.prototype.on = function on(){
 this.emitter.on.apply(this.emitter, arguments);
 return this;
}
