const usernameInput = document.getElementById('username');
const roomnameInput = document.getElementById('roomname');
const roleInput = document.getElementById('role');
const button = document.getElementById('join_leave');
const container = document.getElementById('container');
const count = document.getElementById('count');
const meetingRoomNotStarted = document.getElementById('meetingRoomNotStarted');
let syncClient;
let connected = false;
let room;
let track;

const addLocalVideo = async () => {
  track = await Twilio.Video.createLocalVideoTrack();
  const video = document.getElementById('local').firstElementChild;
  video.appendChild(track.attach());
};

const connectButtonHandler = async (event) => {
  event.preventDefault();
  if (!connected) {
    const username = usernameInput.value;
    const roomname = roomnameInput.value;
    const role = roleInput.value;
    if (!username || !roomname || !role) {
      alert('Enter your name, roomname and role before joining');
      return;
    }
    button.disabled = true;
    button.innerHTML = 'Connecting...';
    try {
      await connect(username, roomname, role);
      button.innerHTML = 'Leave';
      button.disabled = false;
    }
    catch {
      alert('Connection failed. Please contact your administrator?');
      button.innerHTML = 'Join';
      button.disabled = false;
    }
  }
  else {
    disconnect();
    button.innerHTML = 'Join';
    connected = false;
  }
};

const connect = async (username, roomname, role) => {
  const response = await fetch('/get_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, roomname, role }),
  });
  const data = await response.json();
  if (data.videoRoom === true) {
    addLocalVideo();

    meetingRoomNotStarted.style.display = "none";
    container.style.display = "block"
    room = await Twilio.Video.connect(data.token);
    room.participants.forEach(participantConnected);
    room.on('participantConnected', participantConnected);
    room.on('participantDisconnected', participantDisconnected);
    connected = true;
    updateParticipantCount();
  } else {
    meetingRoomNotStarted.style.display = "block";
    container.style.display = "none"
    //do not join the meeting room, subscribe to sync
    try {
      syncClient = new Twilio.Sync.Client(data.token);
      syncClient.document(roomname)
        .then(function (document) {
          // Listen to updates on the Document
          document.on('updated', async function (event) {     //Received Document update event.
            if (event.data.room == 'started') {               //If room is 'started' then make participant join the video room
              meetingRoomNotStarted.style.display = "none";
              container.style.display = "block"
              addLocalVideo();
              room = await Twilio.Video.connect(data.token);
              room.participants.forEach(participantConnected);
              room.on('participantConnected', participantConnected);
              room.on('participantDisconnected', participantDisconnected);
              connected = true;
              updateParticipantCount();
            }
          });
        })
        .catch(function (error) {
          console.error('Unexpected error', error)
        });
    } catch (error) { console.log(error) };
  }
};

const updateParticipantCount = () => {
  if (!connected) {
    count.innerHTML = 'Disconnected.';
  }
  else {
    count.innerHTML = (room.participants.size + 1) + ' participants online.';
  }
};

const participantConnected = (participant) => {
  const participantDiv = document.createElement('div');
  participantDiv.setAttribute('id', participant.sid);
  participantDiv.setAttribute('class', 'participant');

  const tracksDiv = document.createElement('div');
  participantDiv.appendChild(tracksDiv);

  const labelDiv = document.createElement('div');
  labelDiv.innerHTML = participant.identity;
  participantDiv.appendChild(labelDiv);

  container.appendChild(participantDiv);

  participant.tracks.forEach(publication => {
    if (publication.isSubscribed) {
      trackSubscribed(tracksDiv, publication.track);
    }
  })
  participant.on('trackSubscribed', track => trackSubscribed(tracksDiv, track));
  participant.on('trackUnsubscribed', trackUnsubscribed);
  updateParticipantCount();
};

const participantDisconnected = (participant) => {
  document.getElementById(participant.sid).remove();
  updateParticipantCount();
};

const trackSubscribed = (div, track) => {
  div.appendChild(track.attach());
};

const trackUnsubscribed = (track) => {
  track.detach().forEach(element => element.remove());
};

const disconnect = async () => {
  if(syncClient != undefined){                          //Close subscription of sync Document for guests participants
    var syncDoc = await syncClient.document(room.name);
    syncDoc.close();
  }
  track.stop();
  room.disconnect();
  document.getElementById('local').style.display = 'none';
  while (container.lastChild.id != 'local') {
    container.removeChild(container.lastChild);
  }
  button.innerHTML = 'Join';
  connected = false;
  updateParticipantCount();
};

button.addEventListener('click', connectButtonHandler);

