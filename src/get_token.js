const twilio = require('twilio');
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

exports.handler = async function(context, event, callback) {
  let roomName = event.roomname;
  let videoRoomStatus = false;
  let AccessToken = require('twilio').jwt.AccessToken;
  const SyncGrant = AccessToken.SyncGrant;
  let isSyncDocExists;
  
  const accessToken = new twilio.jwt.AccessToken(
    context.ACCOUNT_SID, context.API_KEY_SID, context.API_KEY_SECRET
  );
  
  accessToken.identity = event.username;
  const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
    room: roomName
  });
  
  accessToken.addGrant(videoGrant);
  
  if(event.role == 'host' || event.role == 'co_host'){  //If host or co-host joined the room
    //update sync document
  
    isSyncDocExists = await ifSyncDocExists(roomName);
    if(isSyncDocExists.status === false){
        await createSyncDoc(roomName);
    }
    await updateSyncDoc(roomName);
    videoRoomStatus = true;
  }else{                                                //If any guest joins the room
    let isRoomExists = await isVideoRoomExists(roomName);
    if(isRoomExists.status === true){                   //Check if room exists
      videoRoomStatus = true;
    }else{                                              //If room does not exists then check if Sync document exists
      videoRoomStatus = false;
      isSyncDocExists = await ifSyncDocExists(roomName);
      if(isSyncDocExists.status != true){
        await createSyncDoc(roomName);
      }
    }
  }
  if(!videoRoomStatus){                                 //create and add Sync grant only when Video room does not exists
    let syncGrant = new SyncGrant({
        serviceSid: context.SYNC_SERVICE_SID,
    });
    accessToken.addGrant(syncGrant);
  }
  
  return callback(null, {
    token: accessToken.toJwt(),
    videoRoom: videoRoomStatus
  });
 }
 

async function isVideoRoomExists(roomName) {
    let res = false;
    let status = false;
    try {
        res = await client.video.v1.rooms(roomName)
            .fetch()
        status = true;
    } catch (error) {
        console.log(error);
    }
    return { status, data: res };
}

async function ifSyncDocExists(docName) {
    let res = false;
    let status = false;
    try {
        res = await client.sync.v1.services(process.env.SYNC_SERVICE_SID)
                        .documents(docName)
                        .fetch()
        status = true;
    } catch (error) {
        console.log(error);
    }
    return { status, data: res };
}

async function createSyncDoc(docName) {
    let res = false;
    let status = false;
    try {
        res = await client.sync.v1.services(process.env.SYNC_SERVICE_SID)
                    .documents
                    .create({ uniqueName: docName, data: { room: 'not_started' } })
        status = true;
    } catch (error) {
        console.log(error);
    }
    return { status, data: res };
}

async function updateSyncDoc(docName) {
    let res = false;
    let status = false;
    try {
        res = await client.sync.v1.services(process.env.SYNC_SERVICE_SID)
            .documents(docName)
            .update({ data: { room: 'started' } });
        status = true;
    } catch (error) {
        console.log(error);
    }
    return { status, data: res };
}
