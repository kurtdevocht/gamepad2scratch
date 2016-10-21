/*
    GamepadState represents the cached state of a Gamepad + some additional logic:

        - The state can be converted to a string that is understood by the Scratch 2.0 hhtp interface

        - Some specific calculations are added to allow a more streamlined user experience for both analog and non-alaog mode
*/

var Gamepad = require('./Gamepad.js');

function GamepadState(type, index){
    this._gamepad = new Gamepad(type);
    this._state = {"joystick_left":{},"joystick_right":{}};
    this._index = index;
    this._hookUpEvents();
    this._gamepad.connect();
}

// Converts the state to a string that can be understood by the Scratch 2.0 http interface
GamepadState.prototype.scratchify = function(){
    var result = "";

    // Non-analog mode: emulate button press when left joystick is moved
    result += "button/˄/" + this._index.toString() + " " + ( this._state.up || ( !this._state.analog && this._state.joystick_left.y === 0 ) ) + "\n";
    result += "button/˃/" + this._index.toString() + " " + ( this._state.right || ( !this._state.analog && this._state.joystick_left.x === 255 ) ) + "\n";
    result += "button/˅/" + this._index.toString() + " " + ( this._state.down || ( !this._state.analog && this._state.joystick_left.y === 255 ) )+ "\n";
    result += "button/˂/" + this._index.toString() + " " + ( this._state.left || ( !this._state.analog && this._state.joystick_left.x === 0 ) ) + "\n";
    
    // Nothing special about these buttons...
    result += "button/1/" + this._index.toString() + " " + this._state['1'] + "\n";
    result += "button/2/" + this._index.toString() + " " + this._state['2'] + "\n";
    result += "button/3/" + this._index.toString() + " " + this._state['3'] + "\n";
    result += "button/4/" + this._index.toString() + " " + this._state['4'] + "\n";
    result += "button/l1/" + this._index.toString() + " " + this._state.l1 + "\n";
    result += "button/l2/" + this._index.toString() + " " + this._state.l2 + "\n";
    result += "button/r1/" + this._index.toString() + " " + this._state.r1 + "\n";
    result += "button/r2/" + this._index.toString() + " " + this._state.r2 + "\n";
    result += "button/joystick_left/" + this._index.toString() + " " + this._state.joystick_left_button + "\n";
    result += "button/joystick_right/" + this._index.toString() + " " + this._state.joystick_right_button + "\n";
    result += "button/select/" + this._index.toString() + " " + this._state.select + "\n";
    result += "button/start/" + this._index.toString() + " " + this._state.start + "\n";

    // Caluculate left joystick values
    var joystick_left_x =  this._analogXyToScratch(this._state.joystick_left.x, false, this._state.analog ? 128 : 127 );
    result += "joystick/x/left/" + this._index.toString() + " " + joystick_left_x + "\n";

    var joystick_left_y = this._analogXyToScratch(this._state.joystick_left.y, true, this._state.analog ? 128 : 127 );
    result += "joystick/y/left/" + this._index.toString() + " " + joystick_left_y + "\n";

    result += "joystick_angle/left/" + this._index.toString() + " " + this._xyToAngle(joystick_left_x, joystick_left_y) + "\n";
    
    // Calculate right joystick values
    // => In non-analog mode: emulate joystick movement when buttons 1..4 are pressed
    var joystick_right_x = 0;
    if( this._state.analog ){
        joystick_right_x = this._analogXyToScratch(this._state.joystick_right.x, false, this._state.analog ? 128 : 127);
    }
    else if( this._state['2'] && !this._state['4']){
        joystick_right_x = 100;
    }
    else if( this._state['4'] &&! this._state['2']){
        joystick_right_x = -100;
    }
    result += "joystick/x/right/" + this._index.toString() + " " + joystick_right_x + "\n";

    var joystick_right_y = 0;
    if( this._state.analog ){
        joystick_right_y = this._analogXyToScratch(this._state.joystick_right.y, true, this._state.analog ? 128 : 127);
    }
    else if( this._state['1'] && !this._state['3']){
        joystick_right_y = 100;
    }
    else if( this._state['3'] &&! this._state['1']){
        joystick_right_y = -100;
    }
    result += "joystick/y/right/" + this._index.toString() + " " + joystick_right_y + "\n";

    result += "joystick_angle/right/" + this._index.toString() + " " + this._xyToAngle(joystick_right_x, joystick_right_y) + "\n";

    // Calculated value to indicate that the gamepad is in analog mode
    result += "analog/" + this._index.toString() + " " + this._state.analog + "\n";
    
    return result;
}

GamepadState.prototype._xyToAngle = function(x, y){
    if( x == 0 && y == 0) {
        return 90;
    }
    var result = 180 * Math.atan2(x, y) / Math.PI;
    return isNaN(result) ? 90 : result;
    
}

GamepadState.prototype._analogXyToScratch = function( value, negate, mid ){
    
    // 'mid' depends on analog mode of controller...

    var result = 0;
    
    // Map [mid ... 255] => [0 ... 100]
    if( value > mid ){
        result = 0 + 100 * (value - mid) / (255 - mid);
    }

    // Map [0 ... mid ] => [-100 ... 0]
    if( value < mid){
        result = -100 + 100 * value / mid;
    }

    if( negate ){
        result *= -1;
    }
    return result;
}

GamepadState.prototype._hookUpEvents = function(){
    this._gamepad.on('up:press', function(){
        this._state.up = true;
    }.bind(this));

    this._gamepad.on('up:release',function(){
        this._state.up = false;
    }.bind(this));

    this._gamepad.on('right:press', function(){
        this._state.right = true;
    }.bind(this));

    this._gamepad.on('right:release',function(){
        this._state.right = false;
    }.bind(this));

    this._gamepad.on('down:press', function(){
        this._state.down = true;
    }.bind(this));

    this._gamepad.on('down:release',function(){
        this._state.down = false;
    }.bind(this));

    this._gamepad.on('left:press', function(){
        this._state.left = true;
    }.bind(this));

    this._gamepad.on('left:release',function(){
        this._state.left = false;
    }.bind(this));

     this._gamepad.on('1:press', function(){
        this._state['1'] = true;
    }.bind(this));

    this._gamepad.on('1:release',function(){
        this._state['1'] = false;
    }.bind(this));

    this._gamepad.on('2:press', function(){
        this._state['2'] = true;
    }.bind(this));

    this._gamepad.on('2:release',function(){
        this._state['2'] = false;
    }.bind(this));

    this._gamepad.on('3:press', function(){
        this._state['3'] = true;
    }.bind(this));

    this._gamepad.on('3:release',function(){
        this._state['3'] = false;
    }.bind(this));

    this._gamepad.on('4:press', function(){
        this._state['4'] = true;
    }.bind(this));

    this._gamepad.on('4:release',function(){
        this._state['4'] = false;
    }.bind(this));

     this._gamepad.on('l1:press', function(){
        this._state.l1 = true;
    }.bind(this));

    this._gamepad.on('l1:release',function(){
        this._state.l1 = false;
    }.bind(this));

    this._gamepad.on('l2:press', function(){
        this._state.l2 = true;
    }.bind(this));

    this._gamepad.on('l2:release',function(){
        this._state.l2 = false;
    }.bind(this));

    this._gamepad.on('r1:press', function(){
        this._state.r1 = true;
    }.bind(this));

    this._gamepad.on('r1:release',function(){
        this._state.r1 = false;
    }.bind(this));

    this._gamepad.on('r2:press', function(){
        this._state.r2 = true;
    }.bind(this));

    this._gamepad.on('r2:release',function(){
        this._state.r2= false;
    }.bind(this));

    this._gamepad.on('select:press', function(){
        this._state.select = true;
    }.bind(this));

    this._gamepad.on('select:release',function(){
        this._state.select = false;
    }.bind(this));

    this._gamepad.on('start:press', function(){
        this._state.start = true;
    }.bind(this));

    this._gamepad.on('start:release',function(){
        this._state.start= false;
    }.bind(this));

    this._gamepad.on('joystick_left_button:press', function(){
        this._state.joystick_left_button = true;
    }.bind(this));

    this._gamepad.on('joystick_left_button:release',function(){
        this._state.joystick_left_button= false;
    }.bind(this));

    this._gamepad.on('joystick_right_button:press', function(){
        this._state.joystick_right_button = true;
    }.bind(this));

    this._gamepad.on('joystick_right_button:release',function(){
        this._state.joystick_right_button= false;
    }.bind(this));

     this._gamepad.on('joystick_right:move',function(data){
        this._state.joystick_right.x = data.x;
        this._state.joystick_right.y = data.y;
    }.bind(this));

     this._gamepad.on('joystick_left:move',function(data){
        this._state.joystick_left.x = data.x;
        this._state.joystick_left.y = data.y;

        // Hack to detect if the gamepad is in analog or digital mode:
        // When the left joystick is in idle position, it returns 128 when in analog mode
        // and 127 when in non-analog mode
        // => Will fail if the left joystick is not idle whie analog mode is switched
        if( data.x === 128 ){
            this._state.analog = true;
        }
        if( data.x === 127 ){
            this._state.analog = false;
        }
       
    }.bind(this));

}

module.exports = GamepadState