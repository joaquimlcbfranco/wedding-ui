import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface RsvpPayload {
  name: string;
  attendance: 'both' | 'ceremony' | 'reception' | 'none';
  guests: number;
  others: string[];
  dietary: string | null;
}

@Injectable({ providedIn: 'root' })
export class RsvpService {
  private readonly supabase: SupabaseClient = createClient(
    'https://smgjgpvekpxlyjsdbbue.supabase.co',
    'sb_publishable_dk9_du0HrB8eLBqTcKuxTQ_XbgeJduZ'
  );

  async submitRsvp(payload: RsvpPayload): Promise<void> {
    const { error } = await this.supabase
      .from('rsvps')
      .insert([payload]);

    if (error) {
      throw error;
    }
  }
}
