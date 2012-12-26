var EventEmitter = require("events").EventEmitter;
var eventSponge = require("./EventSponge");
var SingleCharacterSingleSplitter = require("./SingleCharacterSingleSplitter").SingleCharacterSingleSplitter;
var SingleCharacterDelimiterLexerEmitter = require("./SingleCharacterDelimiterLexerEmitter").SingleCharacterDelimiterLexerEmitter;
var SlicingStream = require("./SlicingStream").SlicingStream;
var functionImageStream = require("./FunctionImageStream");
var VaryingBufferStream = require("./VaryingBufferStream").VaryingBufferStream;

var applyFrom = eventSponge.applyFrom;
var EventSponge = eventSponge.EventSponge;
var compose = functionImageStream.compose;
var FunctionImageStream = functionImageStream.FunctionImageStream;

function dictionaryListen(emitter, listeners){
   for(var channel in listeners)
    emitter.on(channel, listeners[channel]);
   return emitter;

 //could be written as
   var alist = (
    function dictionaryToAttributeList(dictionary){
     return Object.keys(dictionary).map(
      function(k){
       return [k, dictionary[k]];
      }
     )
    }
   )(listeners);
   return alist.reduce(
    function(em, kv){
     return em.on(kv[0], kv[1]);
    },
    emitter
   );
 //but even that can be written more tersely as
   return Object.keys(listeners).map(
    function(k){
     return [k, listeners[k]];
    }
   ).reduce(
    (function(){}).apply.bind(emitter.on),
    emitter
   );
 //though, if you already had dictionaryToAttributeList defined, then
   return dictionaryToAttributeList(listeners).reduce(
    (function(){}).apply.bind(emitter.on),
    emitter
   );
 //would be the shortest implementation of dictionaryListen I can think of offhand
 //or at least the shortest one that meets my criteria for macho elegance

 //and dictionaryToAttributeList can be defined as
 function dictionaryToAttributeList(dict){
  return Object.keys(dict).map(function(k){return [k, dict[k]];});
 }
}

function bufferChunks(stream, callback){
 //data from the readable stream doesn't come in all at once

 return (
  function(buffer){
   return stream.on(
    "data",
    [].push.bind(buffer)
   ).on(
    "end",
    compose(callback, [].join.bind(buffer, ""))
   );
  }
 )([]);

 //this could be written as
 return (
  function(buffer){
   return dictionaryListen(
    stream,
    {
     "data": [].push.bind(buffer),
     "end": compose(callback, [].join.bind(buffer, ""))
    }
   );
  }
 )([]);
}

 function forwardChannel(source, channel, target){
  return source.on(channel, target.emit.bind(target, channel));
 }
function pipeStream(source, target){
  return forwardChannel(
   forwardChannel(source, "data", target),
   "end",
   target
  );
}


// http://www.w3.org/TR/html401/interact/forms.html#form-content-type
function decodeUriParameter(chunk){
 return decodeURIComponent(
  chunk.toString().replace("/\\+/g", " ")
 );
}
function uriEncodedChunkSliceLength(chunk, buffer){
 var l = chunk.length;
 if(2 > l) return 0;
 if(0x25 == chunk[l - 2]) return l - 2;
 if(0x25 == chunk[l - 1]) return l - 1;
 return l;
}

function FormStream(stream){
 this.input = new EventEmitter();
 if(stream) pipeStream(stream, this.input);
 this.output = new EventEmitter();
 var that = this;
 this.lexerEmitter = new SingleCharacterDelimiterLexerEmitter(this.input, "&").on(
  "lexer",
  this.handleLexer.bind(this)
 ).on(
  "end",
  this.output.emit.bind(this.output, "end")
 ).resume();//the resume is necessary because it starts paused to avoid a race condition
}
FormStream.decodeUriParameter = decodeUriParameter;
FormStream.uriEncodedChunkSliceLength = uriEncodedChunkSliceLength;
FormStream.prototype.emit = function emit(){
 this.input.emit.apply(this.input, arguments);
 return this;
}
FormStream.prototype.write = function write(chunk){
 return this.emit("data", chunk);
}
FormStream.prototype.on = function on(){
 this.output.on.apply(this.output, arguments);
 return this;
}
FormStream.prototype.handleLexer = function handleLexer(lexer){
 param = new SingleCharacterSingleSplitter(lexer.resume(), "=");
 bufferChunks(
  param.before,
  function(channel){
   var input = param.andAfter;
   this.output.emit(
    "s_" + channel,
    new FunctionImageStream(
     new VaryingBufferStream(
      new SlicingStream(input, 1),
      uriEncodedChunkSliceLength
     ),
     decodeUriParameter
    )
   );
   input.resume();
  }.bind(this)
 );
 param.before.resume();
}


this.EventSponge = EventSponge;
this.SingleCharacterSingleSplitter = SingleCharacterSingleSplitter;
this.SingleCharacterDelimiterLexerEmitter = SingleCharacterDelimiterLexerEmitter;
this.applyFrom = applyFrom;
this.compose = compose;
this.bufferChunks = bufferChunks;
this.SlicingStream = SlicingStream;
this.FunctionImageStream = FunctionImageStream;
this.VaryingBufferStream = VaryingBufferStream;
this.forwardChannel = forwardChannel;
this.pipeStream = pipeStream;
this.FormStream = FormStream;
