var EventEmitter = require("events").EventEmitter;
var EventSponge = require("./EventSponge").EventSponge;

function SingleCharacterSingleSplitter(stream, delimiter){
 this.delimiter = delimiter;
 this.before = new EventSponge();
 this.andAfter = new EventSponge();
 this.foundIt = false;
 this.events = new EventEmitter();
 stream.on("data", this.handleChunk.bind(this));
 stream.on("end", this.end.bind(this));
}
SingleCharacterSingleSplitter.prototype.handleChunk = function(chunk){
 if(this.foundIt) return this.andAfter.emit("data", chunk);
 var i = chunk.toString().indexOf(this.delimiter);
 if(-1 == i) return this.before.emit("data", chunk);
 this.before.emit("data", chunk.slice(0, i));
 this.andAfter.emit("data", chunk.slice(i));
 this.foundIt = true;
 this.before.emit("end");
}
SingleCharacterSingleSplitter.prototype.end = function(){
 this.events.emit("end");
 if(!this.foundIt) this.before.emit("end");
 this.andAfter.emit("end");
}

this.SingleCharacterSingleSplitter = SingleCharacterSingleSplitter;