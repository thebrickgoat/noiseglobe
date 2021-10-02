// show a globe and bars that show sound levels of users currently on site synced with server!!!

//daddy vars
var localPos = 0
var globeTexture;
var globeTheta; 

//raidus of the circle
var r;

var localvolume

// create a array that the to eventually eat the server values to itterate so we don't call firebase a billion times in the draw
var serverData
var serverKeys
var serverKeysLength
      
//create and store approx. pos var
//link to a firebase
var db = firebase.database();
var ref = db.ref('users');
var auth = firebase.auth();
var uid

//anon log-in
auth.signInAnonymously().catch(function(error) {
  console.log('error!')
});


//use html5 geolocation to get a pos val
window.onload = navigator.geolocation.getCurrentPosition(getPosition,showGeoError);

//store and upload localPos
function getPosition(position) {
    localPos = position
    //watch login
    auth.onAuthStateChanged(function(user) {
      if (user) {
    //get uid and jink
       var user = auth.currentUser;
      uid = user.uid;
    //pus values
      db.ref('users/' + uid + '/').set({
        lat: position.coords.latitude,
        long: position.coords.longitude,
        vol: 0
       });
        ref.on('value', function(snapshot){
          serverData = snapshot.val();
          serverKeys = Object.keys(serverData);
          serverKeysLength = serverKeys.length;
          });
      } else {
  //sign out
      }
    });  
}

function showGeoError(error) {
    localPos = 0
    switch(error.code) {
        case error.PERMISSION_DENIED:
        console.log('geoFailed1')
            break;
        case error.POSITION_UNAVAILABLE:
        console.log('geoFailed2')
            break;
        case error.TIMEOUT:
        console.log('geoFailed3')
            break;
        case error.UNKNOWN_ERROR:
        console.log('geoFailed4')
            break;
    }
}

//create and store volume var
var randomVol = Math.floor(Math.random() * 110);
 
//sync volume under current user locaction and listen for changes

//set up drawup

function setup(){
  createCanvas(1150, 650, WEBGL);
  globeTexture = loadImage("https://cdn.glitch.com/578b052e-3049-4383-99b4-73395358240a%2Fglobetexture.png?1544136635589");
  globeTheta = 0;
  inputMic = new p5.AudioIn();
  inputMic.start();
  inputMic.amp(1);
}

// make a centered sphere

function draw(){
    background(0,0);
    translate(0,0,0);
  
    //get volume
    localVolume = inputMic.getLevel()*2500;
  
    // sexy p5 orbitcontrol
    orbitControl();

    //sexy lighting
    ambientLight(204, 17, 136) ;
    directionalLight(120, 25, 25, 0.25, 0.25, 100);

    // texture shpere with globe map
    texture(globeTexture); 
  
    // make sphere rotate slowly on its own
    rotateY(-250)
    rotateY(globeTheta  * 0.001);
    sphere(250);
    specularMaterial(250);
    for(var i = 0; i < serverKeysLength; i++) {
      var k = serverKeys[i]
      var serverLat = radians(serverData[k].lat);
      var serverLon = radians(serverData[k].long);
      var serverVol = serverData[k].vol;
      push();
      
      rotateY(serverLon-.58);
      rotateX(serverLat);
      translate(0,0,250);
      
      fill(204, 17, 136);
      specularMaterial(250);
      box(3, 3, serverVol);
      pop();
    };
  
    //local volume box
    // check if localPos is set and mic enabled
    if(localPos === 0){
      console.log('nullsmacked')
    } else{
      db.ref('users/' + uid + '/').update({
        vol: localVolume
       });
    //convert lat/long to radians
      var lat = radians(localPos.coords.latitude);
      var lon = radians(localPos.coords.longitude);
 
      push();
 
      rotateY(lon-.58);
      rotateX(lat);
      translate(0,0,250);
      
      //get volume level
      fill(204, 17, 136);
      specularMaterial(250);
      box(5, 5, localVolume);
      pop();
    }

    globeTheta += 1;
}
