/**
 * Generate dummy staff data
 * @returns {Array} Array of staff objects
 */
function generateStaff() {
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Jessica',
    'Robert', 'Amanda', 'William', 'Melissa', 'Richard', 'Michelle', 'Joseph',
    'Ashley', 'Thomas', 'Stephanie', 'Charles', 'Jennifer', 'Daniel', 'Nicole',
    'Matthew', 'Elizabeth', 'Anthony', 'Lauren', 'Mark', 'Megan', 'Donald', 'Rachel',
    'Steven', 'Samantha', 'Paul', 'Kimberly', 'Andrew', 'Lisa', 'Joshua', 'Angela',
    'Kenneth', 'Amy', 'Kevin', 'Rebecca', 'Brian', 'Laura', 'George', 'Sharon',
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
    'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
    'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
    'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter',
  ];

  const addresses = [
    '123 Main Street', '456 Oak Avenue', '789 Pine Road', '321 Elm Street',
    '654 Maple Drive', '987 Cedar Lane', '147 Birch Boulevard', '258 Spruce Way',
    '369 Willow Court', '741 Cherry Street', '852 Ash Avenue', '963 Poplar Road',
    '159 First Street', '357 Second Avenue', '468 Third Road', '579 Fourth Lane',
  ];

  const shifts = [
    { start: '06:00', end: '14:00' }, // Morning shift
    { start: '14:00', end: '22:00' }, // Afternoon/Evening shift
    { start: '10:00', end: '18:00' }, // Day shift
    { start: '18:00', end: '02:00' }, // Night shift
  ];

  const notes = [
    'Excellent customer service skills',
    'Experienced in fine dining',
    'Quick learner, very reliable',
    'Great team player',
    'Specializes in wine service',
    'Fluent in multiple languages',
    'Certified sommelier',
    'Background in hospitality management',
    null, // Some staff may not have notes
    null,
    null,
  ];

  const photoUrls = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    '', // Some may not have photos
    '',
  ];

  const staff = [];
  const usedEmails = new Set();

  // Generate 15-25 staff members
  const numStaff = Math.floor(Math.random() * 11) + 15;

  for (let i = 0; i < numStaff; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    
    // Generate unique email
    let email;
    let emailAttempts = 0;
    do {
      const emailNum = Math.floor(Math.random() * 10000);
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailNum}@restaurant.com`;
      emailAttempts++;
      if (emailAttempts > 100) {
        email = `staff${i}${Date.now()}@restaurant.com`;
        break;
      }
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // Generate DOB (age between 18 and 65)
    const age = Math.floor(Math.random() * 47) + 18;
    const birthYear = new Date().getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dob = new Date(birthYear, birthMonth, birthDay);

    const address = addresses[Math.floor(Math.random() * addresses.length)];
    
    // Generate phone number
    const phone = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    const photo = photoUrls[Math.floor(Math.random() * photoUrls.length)];
    
    // Salary between $25,000 and $75,000
    const salary = Math.floor(Math.random() * 50000) + 25000;
    
    const shift = shifts[Math.floor(Math.random() * shifts.length)];
    
    const note = notes[Math.floor(Math.random() * notes.length)];

    staff.push({
      name,
      email,
      dob,
      address,
      phone,
      photo,
      salary,
      shift_start: shift.start,
      shift_end: shift.end,
      notes: note,
      isDeleted: false,
    });
  }

  return staff;
}

module.exports = { generateStaff };
