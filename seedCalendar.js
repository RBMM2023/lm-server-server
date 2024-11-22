// server/seedCalendar2.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function generateDates(startDate, numberOfDays) {
  let dates = [];
  for (let i = 0; i < numberOfDays; i++) {
    const date = new Date(startDate.getTime()); // Create a new date based on startDate
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]); // Format YYYY-MM-DD
  }
  return dates;
}

async function seedCalendar() {
  const startDate = new Date(); // Start from today
  const numberOfDays = 365 * 10; // Generate for 25 years
  const pegs = ['Peg 1', 'Peg 2', 'Peg 3'];

  const dates = generateDates(startDate, numberOfDays);

  // Loop through dates and insert availability for each peg
  for (const date of dates) {
    for (const peg of pegs) {
      const { data: existingData, error: existingDataError } = await supabase
        .from('booking_calendar') // Ensure this matches your Supabase table name
        .select('*')
        .eq('date', date)
        .eq('peg', peg);

      if (existingDataError) {
        console.error(
          'Error checking existing data:',
          existingDataError.message
        );
        continue; // Skip this iteration on error
      }

      if (existingData.length === 0) {
        const { data, error } = await supabase
          .from('booking_calendar')
          .insert([{ date: date, peg: peg, status: 'available' }]);

        if (error) {
          console.error('Error inserting:', error.message);
        } else {
          console.log(`Inserted availability for ${peg} on ${date}`);
        }
      } else {
        console.log(
          `Entry for ${peg} on ${date} already exists, skipping insert.`
        );
      }
    }
  }
  console.log('Data seeding complete!');
}

// Call the seeding function
seedCalendar().catch((error) => {
  console.error('Seeding failed:', error.message);
});
