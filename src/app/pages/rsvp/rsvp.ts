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
import { RsvpService } from './rsvp.service'; // Adjust path if needed

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
  private readonly rsvpService = inject(RsvpService);

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
  readonly submitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

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

  private syncOthers(total: number): void {
    const needed = total - 1;

    while (this.others.length < needed) {
      this.others.push(this.fb.control('', this.nameValidators));
    }
    while (this.others.length > needed) {
      this.others.removeAt(this.others.length - 1);
    }
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.submitError.set(null);

    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    try {
      const raw = this.form.getRawValue();

      await this.rsvpService.submitRsvp({
        name: raw.name.trim(),
        attendance: raw.attendance!,
        guests: raw.guests,
        others: raw.others.map((person) => person.trim()),
        dietary: this.declining ? null : raw.dietary.trim() || null,
      });

      this.submitSuccess.set(true);
    } catch {
      this.submitError.set(
        'We could not save your reply right now—please check your connection and try again.'
      );
    } finally {
      this.submitting.set(false);
    }
  }

  resetForm(): void {
    this.form.reset({ name: '', guests: 1, attendance: null, dietary: '' });
    this.others.clear();
    this.submitted.set(false);
    this.submitSuccess.set(false);
    this.submitError.set(null);
  }
}
