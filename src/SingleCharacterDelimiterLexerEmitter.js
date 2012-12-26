//var EventEmitter = require("events").EventEmitter;
var eventSponge = require("./EventSponge");
//var SingleCharacterSingleSplitter = require("./SingleCharacterSingleSplitter").SingleCharacterSingleSplitter;

var applyFrom = eventSponge.applyFrom;
var EventSponge = eventSponge.EventSponge;

function SingleCharacterDelimiterLexerEmitter(stream, delimiter){
 //TODO rewrite in terms of SingleCharacterSingleSplitter chain
 this.delimiter = delimiter;
 this.emitter = new EventSponge();
 stream.on(
  "data",
  this.handleChunk.bind(this)
 ).on(
  "end",
  function(){
   this.delimit(true);
   this.emitter.emit("end");
  }.bind(this)
 );
 this.delimit();
}
SingleCharacterDelimiterLexerEmitter.prototype.delimit = function delimit(last){
 if(this.buffer)
  this.buffer.emit.bind(this.buffer, "end").apply(this.buffer, arguments);
 delete this.buffer;
 if(!last)
  this.emitter.emit("lexer", this.buffer = new EventSponge());
};
SingleCharacterDelimiterLexerEmitter.prototype.handleChunk = function handleChunk(chunk){
 if(chunk.toString().indexOf(this.delimiter) == -1)
  return this.buffer.emit("data", chunk);
 var tokens = chunk.toString().split(this.delimiter);//not binary-safe
 var remaining = tokens.pop();
 remaining.map(
  function(token){
   this.buffer.emit("data", token);
   this.delimit();
  }
 );
 this.buffer.emit("data", remaining);
};
SingleCharacterDelimiterLexerEmitter.prototype.on = function on(){
 applyFrom(this.emitter, "on", arguments);
 return this;
};
SingleCharacterDelimiterLexerEmitter.prototype.once = function once(){
 applyFrom(this.emitter, "once", arguments);
 return this;
}
SingleCharacterDelimiterLexerEmitter.prototype.pause = function pause(){
 return applyFrom(this.emitter, "pause", arguments);
};
SingleCharacterDelimiterLexerEmitter.prototype.resume = function resume(){
 return applyFrom(this.emitter, "resume", arguments);
};


this.SingleCharacterDelimiterLexerEmitter = SingleCharacterDelimiterLexerEmitter;