import { Any, MongoService, FileService, HttpService, AlertService } from 'wacom';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { User } from 'src/app/core';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	/*
	*	Declarations
	*/
	public user: User = this.empty();
	public roles = ['admin'];
	public users: User[] = [];
	public _users: Any = {};
	constructor(
		private alert: AlertService,
		private mongo: MongoService,
		private http: HttpService,
		private file: FileService,
		private router: Router
	) {
		this.file.add({
			id: 'userAvatarUrl',
			resize: 256,
			part: 'user',
			cb: (file: string | File) => {
				if (typeof file != 'string') return;
				this.user.thumb = file;
			}
		});
		this.mongo.config('user', {
			replace: {
				data: (data: Any, cb: (data: Any) => Any) => {
					if (typeof data != 'object') data = {};
					cb(data);
				},
				is: this.mongo.beObj
			}
		});
		if (localStorage.getItem('waw_user')) {
			this.user = this.mongo.fetch('user', {
				name: 'me'
			}, (user: User) => {
				if (user) {
					this.user = user;
					localStorage.setItem('waw_user', JSON.stringify(user));
				} else {
					this.logout();
				}
			});
		}
		this.users = this.mongo.get('user', (users:User[], obj:Any) => {
			this._users = obj;
		});
	}
	/*
	*	User Management
	*/
	empty() : User {
		return {
			name: '',
			email: '',
			thumb: '',
			is: {},
			data: {}
		}
	}
	create(user: User) {
		this.mongo.create('user', user);
	}
	doc(userId: string) {
		if (!this._users[userId]) {
			this._users[userId] = this.mongo.fetch('user', {
				query: { _id: userId }
			});
		}
		return this._users[userId];
	}
	update() {
		this.mongo.afterWhile(this, () => {
			this.mongo.update('user', this.user);
		});
	}
	save(user: User) {
		this.mongo.afterWhile(this, () => {
			this.mongo.update('user', user, {
				name: 'admin'
			});
		});
	}
	delete(user: User) {
		this.mongo.delete('user', user, {
			name: 'admin'
		});
	}
	change_password(oldPass: string, newPass: string) {
		this.http.post('/api/user/changePassword', {
			newPass: newPass,
			oldPass: oldPass
		}, resp => {
			if (resp) {
				this.alert.info({
					text: 'Successfully changed password'
				});
			} else {
				this.alert.error({
					text: 'Failed to change password'
				});
			}
		});
	}
	logout() {
		this.user = this.empty();
		localStorage.removeItem('waw_user');
		this.router.navigate(['/']);
		this.http.remove('token');
	}
	/*
	*	End of
	*/
}

@Injectable()
export class Admins implements CanActivate {
	constructor(private router: Router) { }
	canActivate() {
		if (localStorage.getItem('waw_user')) {
			const user = JSON.parse(localStorage.getItem('waw_user') as string);
			if (user.is && user.is.admin) return true;
			this.router.navigate(['/profile']);
			return false;
		} else {
			this.router.navigate(['/']);
			return false;
		}
	}
}

@Injectable()
export class Authenticated implements CanActivate {
	constructor(private router: Router) { }
	canActivate() {
		if (localStorage.getItem('waw_user')) {
			return true;
		} else {
			return this.router.navigate(['/']);
		}
	}

}

@Injectable()
export class Guest implements CanActivate {
	constructor(private router: Router) { }
	canActivate() {
		if (localStorage.getItem('waw_user')) {
			return this.router.navigate(['/profile'])
		} else {
			return true;
		}
	}
}
