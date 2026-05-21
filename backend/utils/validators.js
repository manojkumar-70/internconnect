const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

const validateCGPA = (cgpa) => {
  return cgpa >= 0 && cgpa <= 10;
};

const validatePhoneNumber = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateCGPA,
  validatePhoneNumber,
};
