// JavaScript variables holding stream and connection information
let localStream;
let localPeerConnection;
let remotePeerConnection;

// JavaScript variables associated with HTML5 video elements in the page
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

// JavaScript variables assciated with call management buttons in the page
let startButton = document.getElementById("startButton");
let callButton = document.getElementById("callButton");
let hangupButton = document.getElementById("hangupButton");

// Just allow the user to click on the Call button at start-up
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;

// Associate JavaScript handlers with click events on the buttons
startButton.addEventListener("click", start);
callButton.addEventListener("click", call);
hangupButton.addEventListener("click", hangup);

// Utility function for logging information to the JavaScript console
function log(text) {  
    console.log("At time: " + (performance.now() / 1000).toFixed(3) + " --> " + text);
};

// Callback in case of success of the getUserMedia() call
function successCallback(stream){  
    log("Received local stream");
    // Associate the local video element with the retrieved stream
    // if (window.URL) {    
    //     localVideo.srcObject = stream;  
    // } 
    localVideo.srcObject = stream;   
    localStream = stream;
    // We can now enable the Call button  
    callButton.disabled = false;
};

// Function associated with clicking on the Start button
// This is the event triggering all other actions
function start() {

    log("Requesting local stream");

    // First of all, disable the Start button on the page  
    startButton.disabled = true;

    // Now, call getUserMedia()  
    // navigator.mediaDevices.getUserMedia({audio:true, video:true}, 
    navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(function(stream) {
        /* use the stream */
        successCallback(stream);
      })
      .catch(function(error) {
        /* handle the error */
        log("navigator.mediaDevices.getUserMedia error: ", error);    
      });

};

// Function associated with clicking on the Call button
// This is enabled upon successful completion of the Start button handler
function call() {
    
    // First of all, disable the Call button on the page...
    callButton.disabled = true;

    // ...and enable the Hangup button
    hangupButton.disabled = false;

    log("Starting Call...");

    // Note that getVideoTracks() and getAudioTracks() is currently
    // supported in Firefox...
    if(navigator.webkitGetUserMedia || navigator.mozGetUserMedia){
        // Log info about video and audio device in use
        if(localStream.getVideoTracks().length > 0) {
            log(`Using video device: ${localStream.getVideoTracks()[0].label}`);
        };

        if(localStream.getAudioTracks().length > 0) {
            log(`Using video device: ${localStream.getAudioTracks()[0].label}`);
        };
    };

    // Chrome
    if (navigator.webkitGetUserMedia) {
        RTCPeerConnection = webkitRTCPeerConnection;
        // Firefox  
    } else if(navigator.mozGetUserMedia){
        RTCPeerConnection = mozRTCPeerConnection;
        RTCSessionDescription = mozRTCSessionDescription;RTCIceCandidate = mozRTCIceCandidate;  
    }; 

    log("RTCPeerConnection object: " + RTCPeerConnection);

    // This is an optional configuration string, associated with
    // NAT traversal setup
    let servers = null;

    // Create the local PeerConnection object  
    localPeerConnection = new RTCPeerConnection(servers);  
    log("Created local peer connection object localPeerConnection");

    // Add a handler associated with ICE protocol events
    localPeerConnection.onicecandidate = gotLocalIceCandidate;

    // Create the remote PeerConnection object  
    remotePeerConnection = new RTCPeerConnection(servers);  
    log("Created remote peer connection object remotePeerConnection");

    // Add a handler associated with ICE protocol events...
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;

    // ...and a second handler to be activated as soon as the remote
    // stream becomes available.  
    remotePeerConnection.onaddstream = gotRemoteStream;

    // Add the local stream (as returned by getUserMedia())
    // to the local PeerConnection.  
    localPeerConnection.addStream(localStream);  
    log("Added localStream to localPeerConnection");

    // We're all set! Create an Offer to be 'sent' to the callee as soon
    // as the local SDP is ready.  
    localPeerConnection.createOffer(gotLocalDescription, onSignalingError);
};

function onSignalingError(error){    
    console.log('Failed to create signaling message : ' + error.name);
};

// Handler to be called when the 'local' SDP becomes available
function gotLocalDescription(description){
    // Add the local description to the local PeerConnection  
    localPeerConnection.setLocalDescription(description);  
    log("Offer from localPeerConnection: \n" + description.sdp);
    
    // ...do the same with the 'pseudoremote' PeerConnection
    // Note: this is the part that will have to be changed if you want
    // the communicating peers to become remote
    // (which calls for the setup of a proper signaling channel)
     remotePeerConnection.setRemoteDescription(description);

    // Create the Answer to the received Offer based on the 'local' description  
    remotePeerConnection.createAnswer(gotRemoteDescription, onSignalingError);
};

// Handler to be called when the remote SDP becomes available
function gotRemoteDescription(description){
    // Set the remote description as the local description of the
    // remote PeerConnection.  
    remotePeerConnection.setLocalDescription(description);  
    log("Answer from remotePeerConnection: \n" + description.sdp);
    
    // Conversely, set the remote description as the remote description of the
    // local PeerConnection  
    localPeerConnection.setRemoteDescription(description);
};

// Handler to be called when hanging up the call
function hangup() {  
    log("Ending call");

    // Close PeerConnection(s)  
    localPeerConnection.close();  
    remotePeerConnection.close();

    // Reset local variables  
    localPeerConnection = null;  
    remotePeerConnection = null;

    // Disable Hangup button  
    hangupButton.disabled = true;

    // Enable Call button to allow for new calls to be established 
    callButton.disabled = false;
};

// Handler to be called as soon as the remote stream becomes available
function gotRemoteStream(event){
    
    // Associate the remote video element with the retrieved stream
    if (window.URL) {
        remoteVideo.srcObject = event.stream;  
    } 
    
    log("Received remote stream");

};

// Handler to be called whenever a new local ICE candidate becomes available
function gotLocalIceCandidate(event){
    if (event.candidate) {
        
        // Add candidate to the remote PeerConnection 
        remotePeerConnection.addIceCandidate(
            new RTCIceCandidate(event.candidate));
        log("Local ICE candidate: \n" + event.candidate.candidate);  
        
    };
};

// Handler to be called whenever a new remote ICE candidate becomes available
function gotRemoteIceCandidate(event){
    if (event.candidate) {
        // Add candidate to the local PeerConnection    
        localPeerConnection.addIceCandidate(
            new RTCIceCandidate(event.candidate));    
        log("Remote ICE candidate: \n " + event.candidate.candidate);  
    };
};