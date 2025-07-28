export const NEPAL_PROVINCES = [
  { value: 'Koshi', label: 'Koshi Province' },
  { value: 'Madhesh', label: 'Madhesh Province' },
  { value: 'Bagmati', label: 'Bagmati Province' },
  { value: 'Gandaki', label: 'Gandaki Province' },
  { value: 'Lumbini', label: 'Lumbini Province' },
  { value: 'Karnali', label: 'Karnali Province' },
  { value: 'Sudurpashchim', label: 'Sudurpashchim Province' }
];

export const NEPAL_CITIES = [
  // Koshi Province
  { value: 'Biratnagar', label: 'Biratnagar', province: 'Koshi' },
  { value: 'Dharan', label: 'Dharan', province: 'Koshi' },
  { value: 'Itahari', label: 'Itahari', province: 'Koshi' },
  { value: 'Damak', label: 'Damak', province: 'Koshi' },
  { value: 'Birtamod', label: 'Birtamod', province: 'Koshi' },
  
  // Madhesh Province
  { value: 'Janakpur', label: 'Janakpur', province: 'Madhesh' },
  { value: 'Birgunj', label: 'Birgunj', province: 'Madhesh' },
  { value: 'Kalaiya', label: 'Kalaiya', province: 'Madhesh' },
  { value: 'Rajbiraj', label: 'Rajbiraj', province: 'Madhesh' },
  { value: 'Lahan', label: 'Lahan', province: 'Madhesh' },
  
  // Bagmati Province
  { value: 'Kathmandu', label: 'Kathmandu', province: 'Bagmati' },
  { value: 'Lalitpur', label: 'Lalitpur', province: 'Bagmati' },
  { value: 'Bhaktapur', label: 'Bhaktapur', province: 'Bagmati' },
  { value: 'Hetauda', label: 'Hetauda', province: 'Bagmati' },
  { value: 'Bharatpur', label: 'Bharatpur', province: 'Bagmati' },
  { value: 'Bidur', label: 'Bidur', province: 'Bagmati' },
  { value: 'Dhulikhel', label: 'Dhulikhel', province: 'Bagmati' },
  { value: 'Kirtipur', label: 'Kirtipur', province: 'Bagmati' },
  
  // Gandaki Province
  { value: 'Pokhara', label: 'Pokhara', province: 'Gandaki' },
  { value: 'Baglung', label: 'Baglung', province: 'Gandaki' },
  { value: 'Gorkha', label: 'Gorkha', province: 'Gandaki' },
  { value: 'Lamjung', label: 'Lamjung', province: 'Gandaki' },
  { value: 'Besisahar', label: 'Besisahar', province: 'Gandaki' },
  
  // Lumbini Province
  { value: 'Butwal', label: 'Butwal', province: 'Lumbini' },
  { value: 'Siddharthanagar', label: 'Siddharthanagar', province: 'Lumbini' },
  { value: 'Tansen', label: 'Tansen', province: 'Lumbini' },
  { value: 'Ghorahi', label: 'Ghorahi', province: 'Lumbini' },
  { value: 'Tulsipur', label: 'Tulsipur', province: 'Lumbini' },
  { value: 'Nepalgunj', label: 'Nepalgunj', province: 'Lumbini' },
  
  // Karnali Province
  { value: 'Birendranagar', label: 'Birendranagar', province: 'Karnali' },
  { value: 'Dunai', label: 'Dunai', province: 'Karnali' },
  { value: 'Jumla', label: 'Jumla', province: 'Karnali' },
  { value: 'Manma', label: 'Manma', province: 'Karnali' },
  
  // Sudurpashchim Province
  { value: 'Dhangadhi', label: 'Dhangadhi', province: 'Sudurpashchim' },
  { value: 'Mahendranagar', label: 'Mahendranagar', province: 'Sudurpashchim' },
  { value: 'Tikapur', label: 'Tikapur', province: 'Sudurpashchim' },
  { value: 'Silgadhi', label: 'Silgadhi', province: 'Sudurpashchim' }
];

export const getCitiesByProvince = (province: string) => {
  return NEPAL_CITIES.filter(city => city.province === province);
};

export const searchCities = (searchTerm: string, province?: string) => {
  let cities = province ? getCitiesByProvince(province) : NEPAL_CITIES;
  return cities.filter(city => 
    city.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const searchProvinces = (searchTerm: string) => {
  return NEPAL_PROVINCES.filter(province => 
    province.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
