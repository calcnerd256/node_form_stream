var util = require("util");
var StreamStack = require("stream-stack").StreamStack;
function FormEmitter(stream){
    StreamStack.call(this);
}
util.inherits(FormEmitter, StreamStack);

this.FormStream = FormEmitter;
