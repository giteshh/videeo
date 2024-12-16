import { Injectable, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CallService {
  private peerConnection!: RTCPeerConnection;
  private localStream!: MediaStream;
  private remoteStream!: MediaStream;
  private signalingServer!: WebSocket;
  private userId: string | undefined;
  private targetId: string | undefined;

  initializeSignaling() {
    this.signalingServer = new WebSocket('https://videeo-signaling-server-o0ht7dx1d-giteshhs-projects.vercel.app/');
    // this.signalingServer = new WebSocket('ws://localhost:8080');

    this.signalingServer.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (data.type === 'offer') {
        await this.peerConnection.setRemoteDescription(data.offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.sendMessage({ type: 'answer', answer });
      } else if (data.type === 'answer') {
        await this.peerConnection.setRemoteDescription(data.answer);
      } else if (data.type === 'candidate') {
        await this.peerConnection.addIceCandidate(data.candidate);
      }
    };
  }

  setIds(userId: string, targetId: string): void {
    this.userId = userId;
    this.targetId = targetId;
    console.log(`User ID: ${this.userId}, Target ID: ${this.targetId}`);
  }

  async initializeConnection(
    localVideo: ElementRef<HTMLVideoElement>,
    remoteVideo: ElementRef<HTMLVideoElement>
  ) {
    this.peerConnection = new RTCPeerConnection();

    // Add local media stream
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.nativeElement.srcObject = this.localStream;
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Handle remote stream
    this.remoteStream = new MediaStream();
    this.peerConnection.ontrack = (event) => {
      this.remoteStream.addTrack(event.track);
    };
    remoteVideo.nativeElement.srcObject = this.remoteStream;

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendMessage({ type: 'candidate', candidate: event.candidate });
      }
    };
  }

  async makeCall() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.sendMessage({ type: 'offer', offer });
  }

  sendMessage(message: any) {
    this.signalingServer.send(JSON.stringify(message));
  }

  toggleAudio(mute: boolean) {
    this.localStream.getAudioTracks()[0].enabled = !mute;
  }

  toggleVideo(show: boolean) {
    this.localStream.getVideoTracks()[0].enabled = show;
  }

  endCall() {
    this.peerConnection.close();
    this.localStream.getTracks().forEach((track) => track.stop());
    this.signalingServer.close();
  }
}



// # todo old code
//   private peerConnection!: RTCPeerConnection;
//   private localStream!: MediaStream;
//   private remoteStream!: MediaStream;
//   private myId!: string;
//   private remoteId!: string;
//
//   setIds(myId: string, remoteId: string) {
//     this.myId = myId;
//     this.remoteId = remoteId;
//   }
//
//   async initializeConnection(localVideo: ElementRef, remoteVideo: ElementRef) {
//     this.peerConnection = new RTCPeerConnection();
//
//     // Add local media stream
//     this.localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localVideo.nativeElement.srcObject = this.localStream;
//     this.localStream.getTracks().forEach((track) => {
//       this.peerConnection.addTrack(track, this.localStream);
//     });
//
//     // Handle remote stream
//     this.remoteStream = new MediaStream();
//     this.peerConnection.ontrack = (event) => {
//       this.remoteStream.addTrack(event.track);
//     };
//     remoteVideo.nativeElement.srcObject = this.remoteStream;
//
//     // Handle signaling (use signaling server in real-world app)
//     this.peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         console.log('Send ICE Candidate:', event.candidate);
//       }
//     };
//
//     // Call or answer
//     if (this.myId < this.remoteId) {
//       const offer = await this.peerConnection.createOffer();
//       await this.peerConnection.setLocalDescription(offer);
//       console.log('Send Offer:', offer);
//     } else {
//       // Simulate receiving an offer and sending an answer
//     }
//   }
//
//   toggleAudio(mute: boolean) {
//     this.localStream.getAudioTracks()[0].enabled = !mute;
//   }
//
//   toggleVideo(show: boolean) {
//     this.localStream.getVideoTracks()[0].enabled = show;
//   }
//
//   endCall() {
//     this.peerConnection.close();
//     this.localStream.getTracks().forEach((track) => track.stop());
//   }
// }
