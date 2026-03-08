export interface Vaccination {
  id: number;
  livestock_type: string;
  vaccine_name: string;
  date: string;
  dosage: string;
  notes: string;
  completed: boolean;
}

export interface Alert {
  id: number;
  type: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  date: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: { day: string; temp: number; condition: string }[];
}
