// Calculate age from year of birth
export const calculateAge = (yearOfBirth) => {
  if (!yearOfBirth) return 'N/A';
  const currentYear = new Date().getFullYear();
  return currentYear - yearOfBirth;
};
