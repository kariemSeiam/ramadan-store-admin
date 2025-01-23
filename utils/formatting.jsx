// utils/formatting.js

/**
 * Format currency amount in Egyptian Pounds
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount with currency symbol
 */
export const formatCurrency = (amount) => {
  // Handle edge cases
  if (!amount && amount !== 0) return 'غير محدد';
  if (typeof amount !== 'number') return 'غير صالح';

  try {
    return `${amount.toLocaleString('ar-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} جنيه`;
  } catch (error) {
    console.error('Currency formatting error:', error);
    return 'خطأ في التنسيق';
  }
};

/**
 * Format date in Arabic locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return 'غير محدد';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    return dateObj.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'خطأ في التنسيق';
  }
};

/**
 * Format time in Arabic locale
 * @param {string|Date} date - Date to extract time from
 * @returns {string} Formatted time
 */
export const formatTime = (date) => {
  if (!date) return 'غير محدد';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    return dateObj.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'خطأ في التنسيق';
  }
};

/**
 * Format relative time (e.g. "2 days ago")
 * @param {string|Date} date - Date to calculate relative time from
 * @returns {string} Relative time description
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'غير محدد';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    const rtf = new Intl.RelativeTimeFormat('ar-EG', { numeric: 'auto' });
    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
      if (Math.abs(diffInHours) < 1) {
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));
        return rtf.format(diffInMinutes, 'minute');
      }
      return rtf.format(diffInHours, 'hour');
    }

    if (Math.abs(diffInDays) < 30) {
      return rtf.format(diffInDays, 'day');
    }

    const diffInMonths = Math.round(diffInDays / 30);
    return rtf.format(diffInMonths, 'month');
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'خطأ في التنسيق';
  }
};