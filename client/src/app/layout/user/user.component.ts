import { Component, Renderer2 } from '@angular/core';
import { Animation } from "src/app/core/animation";
import { UserService } from 'src/app/services';
import { StoreService } from 'wacom';

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
	animations: [Animation]
})
export class UserComponent {
	public show = false;
	public mode = '';
	constructor(
		private renderer: Renderer2,
		private store: StoreService,
		public us: UserService,
	) {
		this.store.get('mode', (mode: string) => {
			if(mode) {
				this.mode = mode;
				this.renderer.addClass(document.body.parentNode, mode);
			}
		});
	}
	set(mode = '') {
		if (mode) {
			this.store.set('mode', mode);
			this.renderer.addClass(document.body.parentNode, mode);
		} else {
			this.store.remove('mode');
			this.renderer.removeClass(document.body.parentNode, 'dark');
		}
		this.mode = mode;
	}
}
