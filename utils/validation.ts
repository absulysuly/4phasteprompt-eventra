export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password: string): { isValid: boolean, message: string } => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  return { isValid: true, message: '' };
};

export const validateName = (name: string): boolean => {
    return name?.trim().length > 1;
}
