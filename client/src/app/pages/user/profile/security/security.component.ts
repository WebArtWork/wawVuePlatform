import { Component } from '@angular/core';
import { UserService } from 'src/app/services';
@Component({
	selector: 'security',
	templateUrl: './security.component.html',
	styleUrls: ['./security.component.scss']
})
export class SecurityComponent {
	public close = ()=>{};
	public oldPass = '';
	public newPass = '';
	constructor(
		public us: UserService
	) { }
	ngOnInit() {
		document.body.classList.add('_modal-small');
	}
	ngOnDestroy() {
		document.body.classList.remove('_modal-small');
	}
}
