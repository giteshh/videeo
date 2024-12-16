import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {CallService} from '../../services/call.service';


@Component({
  selector: 'app-call',
  standalone: false,

  templateUrl: './call.component.html',
  styleUrl: './call.component.css'
})
export class CallComponent implements AfterViewInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  isMuted = false;
  showVideo = true;

  constructor(private callService: CallService, private router: Router) {}

  ngAfterViewInit(): void {
    this.callService.initializeSignaling();
    this.callService.initializeConnection(this.localVideo, this.remoteVideo);

    // Make a call only for one user (e.g., the caller)
    if (window.confirm('Do you want to start the call?')) {
      this.callService.makeCall();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.callService.toggleAudio(this.isMuted);
  }

  toggleVideo() {
    this.showVideo = !this.showVideo;
    this.callService.toggleVideo(this.showVideo);
  }

  endCall() {
    this.callService.endCall();
    this.router.navigate(['/']);
  }
}
