var pc1 = false;
var pc2 = false;
var localVideoElement = false;
var remoteVideoElement = false;
var localVideoStream = false;
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

function getUserMedia() {
    return new Promise(function(resolve, reject) {
      navigator.mediaDevices.getUserMedia({ //Crossbrowser notice
          'audio': false,
          'video': true
      }).then(function(stream) {
        console.log('MEDIA: ok');
        resolve(stream);
      },
      reject)
    });
}

function setLocalStream(stream) {
    return new Promise(function(resolve) {
        localVideoStream = stream;
        localVideoElement.srcObject = stream;
        console.log('LOCAL STREAM: ok');
        resolve();
    });
}

function createPeerConnection() {
  return new Promise(function(resolve) {
    servers = null;
    if(typeof webkitRTCPeerConnection === 'undefined') {
      webkitRTCPeerConnection = RTCPeerConnection;
    }
    pc1 = new webkitRTCPeerConnection(servers);
    console.log('PC1: ok');
    pc1.onicecandidate = function(e) {
      onIceCandidate(pc1, e);
    };

    pc2 = new webkitRTCPeerConnection(servers);
    console.log('PC2: ok');
    pc2.onicecandidate = function(e) {
      onIceCandidate(pc2, e);
    };

    resolve();
  });
}

function onAddStreamEvent () {
  return new Promise(function(resolve) {
    pc2.onaddstream = gotRemoteStream;
    console.log('PC2 STEAM LISTENER: ok');
    resolve();
  });
}

function addStreamToPC1() {
  return new Promise(function(resolve) {
    pc1.addStream(localVideoStream);
    console.log('PC1 ADD STREAM: ok');
    resolve();
  })
}

function createOffer() {
  return new Promise(function(resolve) {
      pc1.createOffer(
        offerOptions
      ).then(
        function(offer) {
          console.log('CREATE OFFER: ok');
          resolve(offer)
        }
      );
  });
}


function setLocalDescForPC1(offer) {
  return new Promise(function(resolve) {
    pc1.setLocalDescription(offer)
    .then(function() {
      console.log('setLocalDescForPC1: ok');
      resolve(offer);
    })
  });
}

function setRemoteDescForPC2(offer) {
  return new Promise(function(resolve) {
    pc2.setRemoteDescription(offer).then(
      function() {
        console.log('setRemoteDescription: ok');
        resolve(offer);
      }
    );
  })
}


function createAnswer() {
  return new Promise(function(resolve){
    pc2.createAnswer().then(
      function(answer) {
        console.log('CREAT ANSWER: ok');
        resolve(answer);
      }
    );
  });
}

function setLocalDescForPC2(answer) {
  return new Promise(function(resolve) {
    pc2.setLocalDescription(answer).then(
      function() {
        console.log('setLocalDescForPC2: ok');
        resolve(answer)
      }
    );
  })
}

function setRemoteDescForPC1(answer) {
  return new Promise(function(resolve) {
    pc1.setRemoteDescription(answer).then(
      resolve
    );
  })
}

function onCreateAnswerSuccess(desc) {
  console.log('Answer from pc2:\n' + desc.sdp);
  console.log('pc2 setLocalDescription start');
  pc2.setLocalDescription(desc).then(
    function() {
      console.log('pc2');
    },
    function() {
      console.log('onSetSessionDescriptionError')
    }
  );
  console.log('pc1 setRemoteDescription start');
  pc1.setRemoteDescription(desc).then(
    function() {
      console.log('pc1');
    },
    function() {
      console.log('onSetSessionDescriptionError')
    }
  );
}


function gotRemoteStream(e) {
  remoteVideoElement.srcObject = e.stream;
}

function onIceCandidate(pc, event) {
  if (event.candidate) {
    getOtherPc(pc).addIceCandidate(
      new RTCIceCandidate(event.candidate)
    ).then(
      function() {
        console.log('ICE CANDIDATE ADD: success')
      },
      function(err) {
        console.log('ICE CANDIDATE ADD: failed')
      }
    );
  }
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function getcam() {
    getUserMedia()
    .then(setLocalStream)
    .catch(function(error) {
        console.log('Error: ', error);
    });
}

function p2p() {
  createPeerConnection()
    .then(onAddStreamEvent)
    .then(addStreamToPC1)
    .then(createOffer)
    .then(setLocalDescForPC1)
    .then(setRemoteDescForPC2)
    .then(createAnswer)
    .then(setLocalDescForPC2)
    .then(setRemoteDescForPC1)
    .catch(function(error) {
        console.log('Error: ', error);
    });
}

window.addEventListener('load', function() {
    localVideoElement = document.querySelector('.local');
    remoteVideoElement = document.querySelector('.remote');
    document.querySelector('.get-cam').addEventListener('click', getcam);
    document.querySelector('.lets-go').addEventListener('click', p2p);
});
