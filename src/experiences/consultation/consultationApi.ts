import { delay } from '../../mocks/delay';

export type ConsultationMode = 'human_astrologer';

export interface Astrologer {
  id: string;
  name: string;
  speciality: string;
  pricePerMinute: number;
}

/** Mock Consultation API (fictional astrologers). */
export async function fetchAstrologers(_mode: ConsultationMode): Promise<Astrologer[]> {
  await delay(500);
  return [
    { id: 'a1', name: 'Pandit R. Sharma', speciality: 'Vedic', pricePerMinute: 30 },
    { id: 'a2', name: 'Acharya Meera Iyer', speciality: 'KP System', pricePerMinute: 25 },
    { id: 'a3', name: 'Anil Joshi', speciality: 'Numerology', pricePerMinute: 20 },
  ];
}
