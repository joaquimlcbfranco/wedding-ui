import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

type Attendance = 'both' | 'ceremony' | 'reception' | 'none';

interface AttendanceOption {
  value: Attendance;
  title: string;
  detail: string;
}

@Component({
  selector: 'app-rsvp',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './rsvp.html',
  styleUrl: './rsvp.css',
})
export class Rsvp {
  private readonly fb = inject(NonNullableFormBuilder);

  // ---- Edit these ----
  readonly names = 'Blandina & Joaquim';
  readonly minGuests = 1;
  readonly maxGuests = 12;

  readonly options: AttendanceOption[] = [
    {
      value: 'both',
      title: 'Both events',
      detail: 'Ceremony at 13:00 and reception at 16:00',
    },
    {
      value: 'ceremony',
      title: 'Ceremony only',
      detail: 'Igreja de Nossa Senhora da Saúde, Setúbal, at 13:00',
    },
    {
      value: 'reception',
      title: 'Reception only',
      detail: 'Cocktail, dinner and open bar at Herdade de Algeruz, Palmela, from 16:00',
    },
    {
      value: 'none',
      title: "Sorry, we can't make it",
      detail: 'We will miss you, but thank you for letting us know',
    },
  ];
  // --------------------

  readonly submitted = signal(false);

  private readonly nameValidators = [Validators.required, Validators.pattern(/\S/)];

  readonly form = this.fb.group({
    name: ['', this.nameValidators],
    guests: [1, [Validators.required, Validators.min(this.minGuests), Validators.max(this.maxGuests)]],
    attendance: this.fb.control<Attendance | null>(null, Validators.required),
    others: new FormArray<FormControl<string>>([]),
    dietary: ['', Validators.maxLength(500)],
  });

  get name() {
    return this.form.controls.name;
  }

  get guests() {
    return this.form.controls.guests;
  }

  get attendance() {
    return this.form.controls.attendance;
  }

  get others() {
    return this.form.controls.others;
  }

  get declining(): boolean {
    return this.attendance.value === 'none';
  }

  get peopleQuestion(): string {
    return this.declining
      ? 'How many people are you replying for?'
      : 'How many people are you confirming?';
  }

  showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }

  changeGuests(delta: number): void {
    const next = Math.min(this.maxGuests, Math.max(this.minGuests, this.guests.value + delta));
    this.guests.setValue(next);
    this.guests.markAsDirty();
    this.syncOthers(next);
  }

  // The first person is the main name, so we need one extra field for everyone else.
  private syncOthers(total: number): void {
    const needed = total - 1;

    while (this.others.length < needed) {
      this.others.push(this.fb.control('', this.nameValidators));
    }
    while (this.others.length > needed) {
      this.others.removeAt(this.others.length - 1);
    }
  }

  submit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // For now the form does nothing when it is valid.
    // Later: send the email to both of you with this.form.getRawValue()
    // (ignore `dietary` when this.declining is true).
  }
}
