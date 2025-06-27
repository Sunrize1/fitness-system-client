export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Не указана';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Некорректная дата';
    
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year} г.`;
  } catch {
    return 'Некорректная дата';
  }
};


export const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const parseBackendDate = (dateArray: number[] | string): Date => {
  if (typeof dateArray === 'string') {
    return new Date(dateArray);
  }
  
  if (Array.isArray(dateArray) && dateArray.length >= 6) {
    const [year, month, day, hour, minute, second] = dateArray;
    

    const parsedDate = new Date(year, month - 1, day, hour, minute, second);
    
    return parsedDate;
  }
  
  console.warn('Неизвестный формат даты:', dateArray);
  return new Date();
};

export const formatDateForBackend = (date: Date): string => {
  return date.toISOString();
}; 