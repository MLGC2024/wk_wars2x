/*-------------------------------------------------------------------------

	Wraith ARS 2X
	Created by WolfKnight

	This JS file takes inspiration from RandomSean's RS9000 JS file, so 
	thanks to him!
	
-------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------
	Variables
------------------------------------------------------------------------------------*/
var resourceName; 
var uiEdited = false;

const audioNames = 
{
    // Beeps
	beep: "beep.ogg",
	xmit_on: "xmit_on.ogg",
	xmit_off: "xmit_off.ogg",
    done: "done.ogg", 
    
    // Verbal lock 
    front: "front.ogg", 
    rear: "rear.ogg", 
    closing: "closing.ogg", 
    away: "away.ogg"
}

const lockAudio = 
{
    front: { 
        1: "away",
        2: "closing"
    }, 

    rear: {
        1: "closing", 
        2: "away"
    }
}

// Setup the main const element structure, this way we can easily access elements without having the mess
// that was in the JS file for WraithRS
const elements = 
{
	radar: $( "#radarFrame" ),
	remote: $( "#rc" ), 
	toggleDisplay: $( "#toggleDisplay" ), 
	pwrBtn: $( "#pwrBtn" ), 

	uiSettingsBtn: $( "#uiSettings" ), 
	uiSettingsBox: $( "#uiSettingsBox" ), 
	closeUiBtn: $( "#closeUiSettings" ),

	radarScaling: {
		increase: $( "#radarIncreaseScale" ),
		decrease: $( "#radarDecreaseScale" ),
		display: $( "#radarScaleDisplay" )
    }, 

    remoteScaling: {
        increase: $( "#remoteIncreaseScale" ),
		decrease: $( "#remoteDecreaseScale" ),
		display: $( "#remoteScaleDisplay" )
    },

    safezoneSlider: $( "#safezone" ), 
    safezoneDisplay: $( "#safezoneDisplay" ),
    
    keyLock: {
        label: $( "#keyLockLabel" ), 
        stateLabel: $( "#keyLockStateLabel" )
    },

	patrolSpeed: $( "#patrolSpeed" ),

	antennas: {
		front: {
			targetSpeed: $( "#frontSpeed" ),
			fastSpeed: $( "#frontFastSpeed" ),

			dirs: {
				fwd: $( "#frontDirAway" ),
				bwd: $( "#frontDirTowards" ),
				fwdFast: $( "#frontFastDirAway" ), 
				bwdFast: $( "#frontFastDirTowards" )
			},

			modes: {
				same: $( "#frontSame" ),
				opp: $( "#frontOpp" ),
				xmit: $( "#frontXmit" )
			},

			fast: {
				fastLabel: $( "#frontFastLabel" ),
				lockLabel: $( "#frontFastLockLabel" )
			}
		},

		rear: {
			targetSpeed: $( "#rearSpeed" ),
			fastSpeed: $( "#rearFastSpeed" ),

			dirs: {
				fwd: $( "#rearDirTowards" ),
				bwd: $( "#rearDirAway" ), 
				fwdFast: $( "#rearFastDirTowards" ), 
				bwdFast: $( "#rearFastDirAway" )
			},

			modes: {
				same: $( "#rearSame" ),
				opp: $( "#rearOpp" ),
				xmit: $( "#rearXmit" )
			},

			fast: {
				fastLabel: $( "#rearFastLabel" ),
				lockLabel: $( "#rearFastLockLabel" )
			}
		}
	}
}

const modes = 
{
	off: 0, 
	same: 1, 
	opp: 2,
	both: 3
}

const dirs = 
{
	none: 0, 
	closing: 1,
	away: 2
}


/*------------------------------------------------------------------------------------
	Hide elements
------------------------------------------------------------------------------------*/
elements.radar.hide(); 
elements.remote.hide(); 
elements.uiSettingsBox.hide(); 
elements.keyLock.label.hide(); 

elements.uiSettingsBtn.click( function() {
	setUISettingsVisible( true, true );
} )

elements.pwrBtn.click( function() {
	togglePower();
} )


/*------------------------------------------------------------------------------------
	Setters
------------------------------------------------------------------------------------*/
function setRadarVisible( state )
{
	state ? elements.radar.fadeIn() : elements.radar.fadeOut();
}

function setRemoteVisible( state ) 
{
	state ? elements.remote.fadeIn() : elements.remote.fadeOut();
}

function setLight( ant, cat, item, state )
{
	let obj = elements.antennas[ant][cat][item]; 

	if ( state ) {
        obj.addClass( cat == "dirs" ? "active_arrow" : "active" ); 
	} else {
        obj.removeClass( cat == "dirs" ? "active_arrow" : "active" );
	}
}

function setAntennaXmit( ant, state )
{
	setLight( ant, "modes", "xmit", state ); 

	if ( !state ) {
		clearDirs( ant ); 
		elements.antennas[ant].targetSpeed.html( "¦¦¦" );
		elements.antennas[ant].fastSpeed.html( "HLd" ); 
	} else {
		elements.antennas[ant].fastSpeed.html( "¦¦¦" ); 
	}
}

function setAntennaMode( ant, mode )
{
	setLight( ant, "modes", "same", mode == modes.same );
	setLight( ant, "modes", "opp", mode == modes.opp );
}

function setAntennaFastMode( ant, state )
{
	setLight( ant, "fast", "fastLabel", state );
}

function setAntennaLock( ant, state )
{
    setLight( ant, "fast", "lockLabel", state ); 
}

function setAntennaDirs( ant, dir, fastDir )
{
	setLight( ant, "dirs", "fwd", dir == dirs.closing );
	setLight( ant, "dirs", "bwd", dir == dirs.away );

	setLight( ant, "dirs", "fwdFast", fastDir == dirs.closing );
	setLight( ant, "dirs", "bwdFast", fastDir == dirs.away );
}


/*------------------------------------------------------------------------------------
	Clearing functions 
------------------------------------------------------------------------------------*/
function clearModes( ant )
{
	for ( let i in elements.antennas[ant].modes )
	{
		elements.antennas[ant].modes[i].removeClass( "active" ); 
	}

	for ( let a in elements.antennas[ant].fast )
	{
		elements.antennas[ant].fast[a].removeClass( "active" ); 
	}
}

function clearDirs( ant )
{
	for ( let i in elements.antennas[ant].dirs )
	{
		elements.antennas[ant].dirs[i].removeClass( "active_arrow" ); 
	}
}

function clearAntenna( ant )
{
	clearModes( ant );
	clearDirs( ant );

	elements.antennas[ant].targetSpeed.html( "¦¦¦" );
	elements.antennas[ant].fastSpeed.html( "¦¦¦" );
}

function clearEverything()
{
	elements.patrolSpeed.html( "¦¦¦" ); 

	for ( let i in elements.antennas ) 
	{
		clearAntenna( i ); 
	}
}


/*------------------------------------------------------------------------------------
	Radar power functions
------------------------------------------------------------------------------------*/
function togglePower()
{
	sendData( "togglePower", null ); 
}

function poweringUp()
{
	elements.patrolSpeed.html( "888" ); 

	for ( let i of [ "front", "rear" ] )
	{
		let e = elements.antennas[i];

		e.targetSpeed.html( "888" ); 
		e.fastSpeed.html( "888" ); 

		for ( let a of [ "dirs", "modes", "fast" ] )
		{
			for ( let obj in e[a] )
			{
				a == "dirs" ? e[a][obj].addClass( "active_arrow" ) : e[a][obj].addClass( "active" ); 
			}
		}
	}
} 

function poweredUp()
{
	clearEverything(); 

	for ( let ant of [ "front", "rear" ] )
	{
		setAntennaXmit( ant, false );
		setAntennaFastMode( ant, true );    
	}
}

function radarPower( state )
{
	state ? poweringUp() : clearEverything();
}


/*------------------------------------------------------------------------------------
	Audio 
------------------------------------------------------------------------------------*/
function playAudio( name, vol )
{
	let audio = new Audio( "sounds/" + audioNames[name] );
	audio.volume = vol; 
	audio.play();
}

function playLockAudio( ant, dir, vol )
{
    playAudio( ant, vol ); 

    if ( dir > 0 ) 
    {
        setTimeout( function() {
            playAudio( lockAudio[ant][dir], vol ); 
        }, 500 );
    }
}


/*------------------------------------------------------------------------------------
	Radar updating  
------------------------------------------------------------------------------------*/
function updateDisplays( ps, ants )
{
	elements.patrolSpeed.html( ps );

	for ( let ant in ants ) 
	{
		if ( ants[ant] != null ) {
			let e = elements.antennas[ant]; 

			e.targetSpeed.html( ants[ant][0].speed ); 
			e.fastSpeed.html( ants[ant][1].speed ); 

			setAntennaDirs( ant, ants[ant][0].dir, ants[ant][1].dir );
		}
	}
}

function settingUpdate( ants )
{
	for ( let ant in ants )
	{
		setAntennaXmit( ant, ants[ant].xmit );
		setAntennaMode( ant, ants[ant].mode ); 
        setAntennaFastMode( ant, ants[ant].fast );  
		setAntennaLock( ant, ants[ant].speedLocked );
	}
}


/*------------------------------------------------------------------------------------
	Misc
------------------------------------------------------------------------------------*/
function menu( optionText, option )
{
	clearEverything(); 

	elements.antennas.front.targetSpeed.html( optionText[0] );
	elements.antennas.front.fastSpeed.html( optionText[1] );

	elements.patrolSpeed.html( option );
}

function displayKeyLock( state )
{
    elements.keyLock.stateLabel.html( state ? "enabled" : "disabled" );

    elements.keyLock.label.fadeIn();

    setTimeout( function() {
        elements.keyLock.label.fadeOut();
    }, 2000 ); 
}

// This function is used to send data back through to the LUA side 
function sendData( name, data ) {
	$.post( "http://" + resourceName + "/" + name, JSON.stringify( data ), function( datab ) {
		if ( datab != "ok" ) {
			console.log( datab );
		}            
	} );
}

function setUiHasBeenEdited( state )
{
    uiEdited = state; 
}

function hasUiBeenEdited()
{
    return uiEdited;
}

function sendSaveData()
{
    if ( hasUiBeenEdited() ) {
        let data = 
        {
            remote: {
                left: elements.remote.css( "left" ),
                top: elements.remote.css( "top" ),
                scale: remoteScale
            },

            radar: {
                left: elements.radar.css( "left" ),
                top: elements.radar.css( "top" ),
                scale: radarScale
            },

            safezone: safezone 
        }

        sendData( "saveUiData", data );
    }
}

function loadUiSettings( data )
{
    // Iterate through "remote" and "radar"
    for ( let setting of [ "remote", "radar" ] ) 
    {
        // Iterate through the settings
        for ( let i of [ "left", "top" ] )
        {
            // Update the position of the current element 
            elements[setting].css( i, data[setting][i] );
        }

        // Set the scale and update the display
        setScaleAndDisplay( elements[setting], data[setting].scale, elements[setting + "Scaling"].display ); 
    }

    // Update the remote and radar scale variables
    remoteScale = data.remote.scale; 
    radarScale = data.radar.scale; 

    // Set the safezone and update the display
    elements.safezoneSlider.val( data.safezone );
    elements.safezoneSlider.trigger( "input" ); 
}


/*------------------------------------------------------------------------------------
	UI scaling and positioning 
------------------------------------------------------------------------------------*/
var remoteScale = 1.0;
var remoteMoving = false; 
var remoteLastOffset = [ 0, 0 ]; 
var remoteOffset = [ 0, 0 ]; 

var radarScale = 1.0;
var radarMoving = false; 
var radarLastOffset = [ 0, 0 ]; 
var radarOffset = [ 0, 0 ]; 

var windowWidth = 0; 
var windowHeight = 0; 
var safezone = 0; 

// Close the UI settings window when the 'Close' button is pressed
elements.closeUiBtn.click( function() {
	setUISettingsVisible( false, true );
} )

// Set the remote scale buttons to change the remote's scale 
elements.remoteScaling.increase.click( function() {
    remoteScale = changeEleScale( elements.remote, remoteScale, 0.05, elements.remoteScaling.display ); 
} )

elements.remoteScaling.decrease.click( function() {
    remoteScale = changeEleScale( elements.remote, remoteScale, -0.05, elements.remoteScaling.display ); 
} )

// Set the radar scale buttons to change the radar's scale 
elements.radarScaling.increase.click( function() {
    radarScale = changeEleScale( elements.radar, radarScale, 0.05, elements.radarScaling.display ); 
} )

elements.radarScaling.decrease.click( function() {
    radarScale = changeEleScale( elements.radar, radarScale, -0.05, elements.radarScaling.display ); 
} )

// Remote mouse down and up event
elements.remote.mousedown( function( event ) {
    remoteMoving = true; 

    let offset = $( this ).offset();

    remoteOffset = getOffset( offset, event.clientX, event.clientY );
} )

// Radar mouse down and up event
elements.radar.mousedown( function( event ) {
    radarMoving = true; 

    let offset = $( this ).offset();

    radarOffset = getOffset( offset, event.clientX, event.clientY );
} )

$( document ).mouseup( function( event ) {
    // Reset the remote and radar moving variables
    remoteMoving = false; 
    radarMoving = false; 
} )

$( document ).mousemove( function( event ) {
    let x = event.clientX; 
    let y = event.clientY; 

    if ( remoteMoving )
    {
        event.preventDefault();

        calculatePos( elements.remote, x, y, windowWidth, windowHeight, remoteOffset, remoteScale, safezone );
    }

    if ( radarMoving )
    {
        event.preventDefault(); 

        calculatePos( elements.radar, x, y, windowWidth, windowHeight, radarOffset, radarScale, safezone );
    }
} )

$( window ).resize( function() {
    windowWidth = $( this ).width(); 
    windowHeight = $( this ).height(); 
} )

$( document ).ready( function() {
    windowWidth = $( window ).width(); 
    windowHeight = $( window ).height();
} )

elements.safezoneSlider.on( "input", function() {
    let val = $( this ).val();
    safezone = parseInt( val, 10 ); 

    elements.safezoneDisplay.html( val + "px" ); 
} )

function calculatePos( ele, x, y, w, h, offset, scale, safezone )
{
    let eleWidth = ( ele.outerWidth() * scale );
    let eleHeight = ( ele.outerHeight() * scale );
    let eleWidthPerct = ( eleWidth / w ) * 100; 
    let eleHeightPerct = ( eleHeight / h ) * 100; 
    let eleWidthPerctHalf = eleWidthPerct / 2; 
    let eleHeightPerctHalf = eleHeightPerct / 2;

    let maxWidth = w - eleWidth;
    let maxHeight = h - eleHeight; 

    let left = clamp( x + offset[0], 0 + safezone, maxWidth - safezone );
    let top = clamp( y + offset[1], 0 + safezone, maxHeight - safezone );

    let leftPos = ( left / w ) * 100; 
    let topPos = ( top / h ) * 100; 

    let leftLockGap = leftPos + eleWidthPerctHalf; 
    let topLockGap = topPos + eleHeightPerctHalf;

    // Lock pos check 
    if ( leftLockGap >= 48.0 && leftLockGap <= 52.0 ) 
    {
        leftPos = 50.0 - eleWidthPerctHalf; 
    }

    if ( topLockGap >= 48.0 && topLockGap <= 52.0 ) 
    {
        topPos = 50.0 - eleHeightPerctHalf; 
    }

    updatePosition( ele, leftPos, topPos );
    setUiHasBeenEdited( true ); 
}

function updatePosition( ele, left, top )
{
    ele.css( "left", left + "%" );
    ele.css( "top", top + "%" );
}

function getOffset( offset, x, y )
{
    return [
        offset.left - x, 
        offset.top - y
    ]
}

function setUISettingsVisible( state, remote )
{
	state ? elements.uiSettingsBox.fadeIn() : elements.uiSettingsBox.fadeOut(); 
	// if ( remote ) { setRemoteVisible( !state ); }
}

function hideUISettings()
{
	if ( !elements.uiSettingsBox.is( ":hidden" ) ) {
		elements.uiSettingsBox.hide(); 
	}
}

function changeEleScale( ele, scaleVar, amount, display )
{
    // Change the scale of the element and update it's displayer
    let scale = changeScale( ele, scaleVar, amount ); 
    display.html( scale.toFixed( 2 ) + "x" );

    // Tell the system the UI has been edited
    // !uiEdited ? uiEdited = true : null; 
    setUiHasBeenEdited( true ); 

    return scale; 
}

function changeScale( ele, current, amount )
{
    let scale = clamp( current + amount, 0.25, 2.5 ); 
    ele.css( "transform", "scale(" + scale + ")" );

    return scale; 
}

function setScaleAndDisplay( ele, scale, display )
{
    ele.css( "transform", "scale(" + scale + ")" );
    display.html( scale.toFixed( 2 ) + "x" );
}

function clamp( num, min, max )
{
	return num < min ? min : num > max ? max : num;
}


/*------------------------------------------------------------------------------------
	Button click event assigning 
------------------------------------------------------------------------------------*/
// This runs when the JS file is loaded, loops through all of the remote buttons and assigns them an onclick function
elements.remote.find( "button" ).each( function( i, obj ) {
	if ( $( this ).attr( "data-nuitype" ) ) {
		$( this ).click( function() { 
			let type = $( this ).data( "nuitype" ); 
			let value = $( this ).attr( "data-value" ) ? $( this ).data( "value" ) : null; 
			let mode = $( this ).attr( "data-mode" ) ? $( this ).data( "mode" ) : null; 

			sendData( type, { value, mode } ); 
		} )
	}
} );


/*------------------------------------------------------------------------------------
    Close the remote when the user presses the 'Escape' key or the right mouse button 
------------------------------------------------------------------------------------*/
function closeRemote()
{
    sendData( "closeRemote", null );
	setRemoteVisible( false );
    setUISettingsVisible( false, false );
    
    sendSaveData(); 
}

$( document ).keyup( function( event ) {
    if ( event.keyCode == 27 ) 
	{
		closeRemote();
	}
} );

$( document ).contextmenu( function() {
    closeRemote(); 
} );


/*------------------------------------------------------------------------------------
    The main event listener, this is where the NUI messages sent by the LUA side arrive 
    at, they are then handled properly via a switch/case that runs the relevant code
------------------------------------------------------------------------------------*/
window.addEventListener( "message", function( event ) {
	var item = event.data; 
	var type = event.data._type; 

	switch ( type ) {
		case "updatePathName":
			resourceName = item.pathName
            break;
        case "loadUiSettings":
            loadUiSettings( item.data );
            break;
		case "openRemote":
            setRemoteVisible( true );
            // uiEdited = false;
            setUiHasBeenEdited( false ); 
			break; 
		case "toggleDisplay":
			setRadarVisible( item.state );
			break; 
		case "radarPower":
			radarPower( item.state );
			break; 
		case "poweredUp":
			poweredUp();
			break;
		case "update":
			updateDisplays( item.speed, item.antennas );
			break; 
		case "antennaXmit":
			setAntennaXmit( item.ant, item.on );
			break; 
		case "antennaMode":
			setAntennaMode( item.ant, item.mode ); 
			break; 
		case "antennaLock":
            setAntennaLock( item.ant, item.state );
            break; 
        case "antennaFast":
            setAntennaFastMode( item.ant, item.state ); 
            break; 
		case "menu":
			menu( item.text, item.option ); 
			break;
		case "settingUpdate":
			settingUpdate( item.antennaData ); 
			break; 
		case "audio":
			playAudio( item.name, item.vol ); 
            break; 
        case "lockAudio":
            playLockAudio( item.ant, item.dir, item.vol ); 
            break; 
        case "displayKeyLock":
            displayKeyLock( item.state );
            break; 
		default:
			break;
	}
} );