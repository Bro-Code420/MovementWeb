/**
 * Strip server-only fields from an Employee document before it goes out
 * over the wire. `personalDetails.password` and the whole `totp` block are
 * secrets: the schema marks them `select: false`, but a freshly created or
 * explicitly re-selected document still carries them in memory.
 */
const sanitizeEmployee = (employee) => {
  if (!employee) return employee;

  const plain = typeof employee.toObject === "function" ? employee.toObject() : { ...employee };

  if (plain.personalDetails) {
    delete plain.personalDetails.password;
    delete plain.personalDetails.encryptedPassword;
  }
  if (plain.totp) {
    plain.totp = {
      enabled: !!plain.totp.enabled,
      enrolledAt: plain.totp.enrolledAt,
    };
  }

  return plain;
};

export default sanitizeEmployee;
