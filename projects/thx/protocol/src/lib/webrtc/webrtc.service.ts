import { Injectable, inject } from '@angular/core';
// uuid
import { v4 as uuidv4 } from 'uuid';
// services 
import { CryptoService } from '../crypto/crypto.service';
// rxjs
import { Subject } from 'rxjs';
import { SocketMessage, PeerMessage, PeerConnectionObject, ThxMessage } from '../interfaces';


interface Algorithm {
  name: string,
  hash: string,
  modulusLength: number,
  publicExponent: Uint8Array
}

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {

  // see example here https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/messaging/main.js
  // maximum peer connections limit is 256, see: https://stackoverflow.com/a/59000150/7185355

  public onConnectionEvent: Subject<any> = new Subject();
  public onPeerMessage: Subject<PeerMessage> = new Subject();
  public onPeerDataChannel: Subject<PeerConnectionObject> = new Subject();
  // public onDataChannelOpen: Subject<>

  private peerConnections: any = {}; // { roomId: {} }

  protected cryptoService!: CryptoService;

  constructor() {
    // this.init();
    this.cryptoService = inject(CryptoService);
  }

  async createOffer(roomId: string, socketId: string): Promise<RTCSessionDescriptionInit> {
    const pc = await this.createConnection();
    /* CREATE DATA CHANNEL FOR PEER CONNECTION */
    const dataChannel = pc.createDataChannel(uuidv4(), { ordered: true });

    dataChannel.onopen = (e: Event) => {
      console.log('dataChannel open', e);

    };
    /* data channel recieved message */
    dataChannel.onmessage = (e: MessageEvent) => {
      const messageBody = JSON.parse(e.data);
      if(messageBody.sharedSecret) { // if not keys handshake
        this.decryptAndEmitMessage(messageBody, roomId, socketId, dataChannel);
      } else {
        this.onPeerMessage.next({
          roomId: roomId,
          socketId: socketId,
          body: messageBody,
          channel: dataChannel
        });
      }
      
    };

    dataChannel.onclose = (e: Event) => console.log('dataChannel close', e);
    // console.warn('Created recieve data channel: ', dataChannel); 
    /* CREATE OFFER */
    const offer = await pc.createOffer(/* TODO */);
    await pc.setLocalDescription(offer);
    /* STORE CONNECTION IN ROOM */
    const pco: PeerConnectionObject = this.storePeerConnectionObject(roomId, socketId, pc);
    // add remote data channel (channel to send messages)
    pc.ondatachannel = (e: RTCDataChannelEvent) => {
      console.log('ondatachannel', e);
      pco.dataChannel = e.channel;
      // console.warn('TODO: handshake for crypto');
      this.onPeerDataChannel.next(pco);
    }

    pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      // console.warn('ICE CANDIDATE FROM --LOCAL-- CONNECTION');
      if (e.candidate) {
        const socketMessage: SocketMessage = {
          cmd: 'ice_candidate',
          roomId: roomId,
          body: {
            ice: e.candidate,
            socketId: socketId
          }
        }
        this.onConnectionEvent.next({
          type: 'onicecandidate',
          event: e,
          response: socketMessage
        });
      }
    }

    return offer;
  }

  async createAnswer(roomId: string, socketId: string, offer: any): Promise<RTCSessionDescriptionInit> {
    const pc = await this.createConnection();
    /* CREATE DATA CHANNEL FOR PEER CONNECTION */
    /* TODO: create method for data channel -> now is everything twice */
    const dataChannel = pc.createDataChannel(uuidv4(), { ordered: true });

    dataChannel.onopen = (e: Event) => {
      console.log('dataChannel open', e);
    };
    /* data channel recieved message */
    dataChannel.onmessage = (e: MessageEvent) => {
      const messageBody = JSON.parse(e.data);
      // console.log('messageBody', messageBody);
      if(messageBody.sharedSecret) { // if not keys handshake
        // console.warn('2. DECRYPT MESSAGE', messageBody);
        this.decryptAndEmitMessage(messageBody, roomId, socketId, dataChannel);
      } else {
        // non encrypted message
        this.onPeerMessage.next({
          roomId: roomId,
          socketId: socketId,
          body: messageBody,
          channel: dataChannel
        });
      }
      
    };
    dataChannel.onclose = (e: Event) => console.log('dataChannel close', e);
    // console.warn('Created send data channel: ', dataChannel); 
    // set remote description
    await pc.setRemoteDescription(offer);
    // create answer
    const answer = await pc.createAnswer(/* TODO */);
    // set loacl description
    await pc.setLocalDescription(answer);

    /* STORE PEER CONNECTION OBJECT */
    const pco = this.storePeerConnectionObject(roomId, socketId, pc);
    // console.warn('RTC_CONNECTIONS', this.peerConnections);

    pc.ondatachannel = (e: RTCDataChannelEvent) => {
      if (e.channel) {
        // add remote data channel
        // console.log('ondatachannel', e);
        pco.dataChannel = e.channel;
        // console.warn('TODO: handshake for crypto');
        this.onPeerDataChannel.next(pco);
      }
    }

    pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate) {
        // console.warn('ON ICE CANDIDATE –> connection',);
        const socketMessage: SocketMessage = {
          cmd: 'ice_candidate',
          roomId: roomId,
          body: {
            ice: e.candidate,
            socketId: socketId
          }
        }
        this.onConnectionEvent.next({
          type: 'onicecandidate',
          event: e,
          response: socketMessage
        });
      }
    }

    return answer;

  }

  /* 
    1. set remote description to my connection (answer)
  */

  private decryptAndEmitMessage(messageBody: any, roomId: string, socketId: string, dataChannel: RTCDataChannel): any {
    const encryptedMessageContent = atob(messageBody.message);
    let decryptedMessageContent = decodeURIComponent(this.cryptoService.decryptMessageWithAESKey(
      encryptedMessageContent,
      this.cryptoService.decryptSharedSecret(messageBody.sharedSecret)
    ));
    try {
      decryptedMessageContent = JSON.parse(decryptedMessageContent);
    } catch (e) {
      console.info('not an object');
    }
    messageBody.message = decryptedMessageContent;
    // console.log('DECRYPTED MESSAGE BODY', decodeURIComponent(decryptedMessageContent));
    this.onPeerMessage.next({
      roomId: roomId,
      socketId: socketId,
      body: messageBody,
      channel: dataChannel
    });
  }

  setRemoteDescription(roomId: string, socketId: string, description: any): void {
    if (this.peerConnections[roomId] && this.peerConnections[roomId][socketId]) {
      const c = this.peerConnections[roomId][socketId];
      c.connection.setRemoteDescription(description);
    } else {
      console.info('setRemoteDescription -> connection not exist yet :(', this.peerConnections);
    }
  }

  addIceCandidate(roomId: string, socketId: string, ice: any): void {
    if (this.peerConnections[roomId] && this.peerConnections[roomId][socketId]) {
      const c = this.peerConnections[roomId][socketId];
      c.connection.addIceCandidate(ice);
    } else {
      console.info('addIceCandidate -> connection not exist yet :(', this.peerConnections);
    }
  }

  isPeerEstablishedForRoom(roomId: string): boolean {
    /* TODO: this fire even if only one peer connection established... :/ */
    if (this.peerConnections[roomId]) return true;
    return false;
  }

  isPeerEstablishedForUser(roomId: string, userId: string): boolean {
    const roomConnections: any = this.peerConnections[roomId];
    for (const socketId in roomConnections) {
      const pco: PeerConnectionObject = this.peerConnections[roomId][socketId];
      if (pco.userId && pco.userId === userId) return true;
    } 
    return false;
  }

  broadcastMessageToRoom(roomId: string, message: ThxMessage): void {
    // console.warn(`BROADCAST MESSAGE TO ROOM ${roomId}`, message);
    const pcos = this.peerConnections[roomId];
    for (const socketId in pcos) {
      const pco = this.peerConnections[roomId][socketId];
      this.sendEncryptedMessageToPCO(pco, message);
    }
  }

  sendMessageToUserInRoom(roomId: string, userId: string, message: ThxMessage): void {
    const pco: PeerConnectionObject | null = this.getUserRoomPCO(roomId, userId);
    if (pco) {
      this.sendEncryptedMessageToPCO(pco, message);
    }
  }

  private sendEncryptedMessageToPCO(pco: PeerConnectionObject, message: ThxMessage): void {
    if (pco.publicKey && pco.dataChannel) {
      const encryptedSharedSecret = this.cryptoService.encryptSharedSecretWithCustomKey(
        this.cryptoService.sharedSecret,
        pco.publicKey
      );
      message.secure = true;
      message.p2p = true;
      pco.dataChannel.send(JSON.stringify(
        {
          message: btoa(this.cryptoService.encryptMessageWithAESKey(encodeURIComponent(typeof message === 'string' ? message : JSON.stringify(message)), this.cryptoService.sharedSecret)),
          sharedSecret: encryptedSharedSecret
        }
      ));
    }
  }

  private getUserRoomPCO(roomId: string, userId: string): PeerConnectionObject | null {
    if (this.peerConnections[roomId]) {
      for (const socketId in this.peerConnections[roomId]) {
        const pco: PeerConnectionObject = this.peerConnections[roomId][socketId];
        if (pco.userId && pco.userId === userId) return pco;
      }
    }
    return null;
  }

  addPublicKeyToPCO(roomId: string, socketId: string, key: string): void {
    const pco = this.peerConnections[roomId][socketId];
    pco.publicKey = key;
  }

  addUserIdToPCO(roomId: string, socketId: string, userId: string): void {
    const pco = this.peerConnections[roomId][socketId];
    pco.userId = userId;
    console.log('ADD USER ID TO PCO', pco);
  }

  disconnect(): void {
    console.warn('TODO: disconnect peer connections.');
  }

  private storePeerConnectionObject(roomId: string, socketId: string, connection: RTCPeerConnection): PeerConnectionObject {
    if (!this.peerConnections[roomId]) this.peerConnections[roomId] = {};
    const peerConnectionObject: PeerConnectionObject = {
      connection: connection,
      dataChannel: null,
      publicKey: undefined,
      userId: undefined
    }
    this.peerConnections[roomId][socketId] = peerConnectionObject;
    return peerConnectionObject;
  }

  private async createConnection(): Promise<RTCPeerConnection> {
    const algorithm: Algorithm = {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
    }
    const certs = await RTCPeerConnection.generateCertificate(algorithm);
    console.warn('------------CERTS------------', certs);
    const connection = new RTCPeerConnection({
      certificates: [certs],
      iceServers: [
        {
          'urls': 'stun:stun.l.google.com:19302'
        }
      ]
    });
    // connection.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    //   console.log('onicecandidate', e);
    // }
    connection.onconnectionstatechange = (e: Event) => {
      // console.log('onconnectionstatechange', e);
      this.onConnectionEvent.next(e);
    }
    // TODO LISTENERS
    // connection.onicecandidateerror = (e: RTCPeerConnectionIceErrorEvent) => {
    //   console.error('onicecandidateerror', e);
    // }
    // connection.onicegatheringstatechange = (e: Event) => {
    //   console.log('onicegatheringstatechange', e);
    // }
    connection.oniceconnectionstatechange = (e: Event) => {
      console.log('oniceconnectionstatechange', e);
    }
    // connection.onnegotiationneeded = (e: Event) => {
    //   console.log('onnegotiationneeded', e);
    // }
    // connection.onsignalingstatechange = (e: Event) => {
    //   console.log('onsignalingstatechange', e);
    // }
    return connection;
  }

}
