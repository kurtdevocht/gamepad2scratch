var GamepadState = require( './GamepadState.js');
var express = require('express');
var process = require('process');
var colors = require('colors');

var gamepadStates;
var  expressApp;
var port = 15005;

printIntroScreen();
findGamepads();
launchHttpInterface();
printWoohoow();

function launchHttpInterface(){

    console.log( "Launching Scratch http interface...");

    expressApp = express();
        
    expressApp.get('/poll', function(req, res){
        res.set('Content-Type', 'text/plain');

        var body = buildStateString(gamepadStates);
        body += 'gamepads ' + gamepadStates.length.toString() + '\n';
        res.send(body);
    });

    expressApp.listen(port)
        .on( 'error', function( data ) {
            printBigError();
            console.log();
            console.log("Failed to start http interface :-(".red);
            console.log("Is another application still running?".red);
            console.log();
            console.log( JSON.stringify(data));
            process.exit( -1 );
        }
    );
}

function printIntroScreen(){
    console.log("  _____                                      _ ".yellow);
    console.log(" / ____|                                    | |".yellow);
    console.log("| |  __  __ _ _ __ ___   ___ _ __   __ _  __| |".yellow);
    console.log("| | |_ |/ _` | '_ ` _ \\ / _ \\ '_ \\ / _` |/ _` |".yellow);
    console.log("| |__| | (_| | | | | | |  __/ |_) | (_| | (_| |".yellow);
    console.log("\\_____ |\\__,_|_| |_| |_|\\___| .__/ \\__,_|\\__,_|".yellow);
    console.log("  ___   _____               | |      _         ".yellow);
    console.log(" |__ \\ / ____|              |_|     | |        ".yellow);
    console.log("    ) | (___   ___ _ __ __ _| |_ ___| |__      ".yellow);
    console.log("   / / \\___ \\ / __| '__/ _` | __/ __| '_ \\     ".yellow);
    console.log("  / /_ ____) | (__| | | (_| | || (__| | | |    ".yellow);
    console.log(" |____|_____/ \\___|_|  \\__,_|\\__\\___|_| |_|    ".yellow);
    console.log();
}

function findGamepads(){
    console.log( "Looking for gamepads...");
    try{
        gamepadStates = [new GamepadState( 'microntek/gamepad', 1)];
    }
    catch( error ){
        printBigError();
        console.log();
        console.log("It looks like there is no joystick".red);
        console.log("or gamepad connected to you computer :-(".red);
        process.exit( -1 );
    }
}

function buildStateString( states ){
    var result = "";
    for( var i = 0; i < states.length; i++){
        var state = states[ i ];
        result += state.scratchify();
    }
    return result;
}

function printBigError(){
    console.log(" ______ _____  _____   ____  _____  _ ".red);
    console.log("|  ____|  __ \\|  __ \\ / __ \\|  __ \\| |".red);
    console.log("| |__  | |__) | |__) | |  | | |__) | |".red);
    console.log("|  __| |  _  /|  _  /| |  | |  _  /| |".red);
    console.log("| |____| | \\ \\| | \\ \\| |__| | | \\ \\|_|".red);
    console.log("|______|_|  \\_\\_|  \\_\\\\____/|_|  \\_(_)".red);
}

function printWoohoow(){
    console.log();
    console.log("*****************************************************".green);
    console.log(" __          __         _                         _ ".green);
    console.log(" \\ \\        / /        | |                       | |".green);
    console.log("  \\ \\  /\\  / /__   ___ | |__   ___   _____      _| |".green);
    console.log("   \\ \\/  \\/ / _ \\ / _ \\| '_ \\ / _ \\ / _ \\ \\ /\\ / / |".green);
    console.log("    \\  /\\  / (_) | (_) | | | | (_) | (_) \\ V  V /|_|".green);
    console.log("     \\/  \\/ \\___/ \\___/|_| |_|\\___/ \\___/ \\_/\\_/ (_)".green);
    console.log();
    console.log("All is ok!".green);
    console.log("");
    console.log(" - Start the Scratch offline editor".white);
    console.log(" - Click 'File' while holding the SHIFT key".white);
    console.log(" - Click 'Import experimental HTTP extension'".white);
    console.log(" - Select the '.s2e'-file".white);
    console.log(" - Look in 'More blocks' and start building cool stuff!".white);
    console.log("");
    console.log(("Check http://localhost:" + port.toString() + "/poll (It's cool :-)").grey);
    console.log("Press CTRL+C to stop...".grey);
    console.log("*****************************************************".green);
}