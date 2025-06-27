
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