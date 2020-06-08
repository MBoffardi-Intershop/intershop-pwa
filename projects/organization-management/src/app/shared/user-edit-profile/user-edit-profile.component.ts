import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ish-user-edit-profile',
  templateUrl: './user-edit-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditProfileComponent {
  @Input() form: FormGroup;
  @Input() titles: string[];
  @Input() editing = false;
}
