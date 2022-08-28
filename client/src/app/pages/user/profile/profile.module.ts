import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { ProfileComponent } from './profile.component';
import { Routes, RouterModule } from '@angular/router';
import { SecurityComponent } from './security/security.component';

const routes: Routes = [{
	path: '',
	component: ProfileComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CoreModule
	],
	declarations: [
		ProfileComponent,
		SecurityComponent
	],
	providers: []

})

export class ProfileModule { }
