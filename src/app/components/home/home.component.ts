import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {CallService} from '../../services/call.service';


@Component({
  selector: 'app-home',
  standalone: false,

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent  {

  myId = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit ID
  remoteId: string = '';

  constructor(private router: Router,
              private callService: CallService) {}

  startCall() {
    if (this.remoteId) {
      this.callService.setIds(this.myId, this.remoteId);
      this.router.navigate(['/call']);
    }
  }
}
