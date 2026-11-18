import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface WeddingEvent {
  id: string;
  title: string;
  description?: string;
  time: string;
  timeLabel: string;
  venue: string;
  place: string;
  mapQuery: string;
  details: string[];
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // ---- Edit these ----
  readonly names = 'Blandina & Joaquim';
  readonly dateLong = 'Saturday, 5 June 2027';
  private readonly weddingDate = new Date('2027-06-05T13:00:00');
  readonly rsvpDeadline = ''; // e.g. '1 May 2027' (leave empty to hide)
  readonly travelNote = ''; // e.g. 'Transport between the church and the estate will be provided.'

  readonly events: WeddingEvent[] = [
    {
      id: 'ceremony',
      title: 'Religious Ceremony',
      description: 'Church celebration followed by a small snack',
      time: '13:00',
      timeLabel: '1:00 PM',
      venue: 'Igreja de Nossa Senhora da Saúde',
      place: 'Setúbal',
      mapQuery: 'Igreja de Nossa Senhora da Saúde, Setúbal',
      details: [], // e.g. 'Parking is available next to the church.'
    },
    {
      id: 'reception',
      title: 'Reception',
      description: 'Cocktail, dinner and party',
      time: '16:00',
      timeLabel: '4:00 PM',
      venue: 'Herdade de Algeruz',
      place: 'Palmela',
      mapQuery: 'Herdade de Algeruz, Palmela',
      details: [], // e.g. 'Dress code: cocktail attire.'
    },
  ];
  // --------------------

  get daysLeft(): number {
    const ms = this.weddingDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  }

  get countdown(): string {
    const d = this.daysLeft;
    return d === 1 ? '1 day to go' : `${d} days to go`;
  }

  mapLink(query: string): string {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  }

  hide(event: Event): void {
    (event.target as HTMLElement).style.display = 'none';
  }
}
