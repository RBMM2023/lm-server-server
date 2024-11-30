/*server.js
const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware'); // Ensure this points to your middleware file
const { DateTime } = require('luxon');
const cron = require('node-cron'); // Import node-cron for scheduling

// Load environment variables from .env file
dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://127.0.0.1:5173', // Adjust this for production
  })
);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Root endpoint for basic server verification
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Check if user credentials match .env values
  if (
    email === process.env.FISHERY_OWNER_EMAIL &&
    password === process.env.FISHERY_OWNER_PASSWORD
  ) {
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ message: 'Login successful', token }); // Send token to client
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

app.get('/api/calendar', async (req, res) => {
  try {
    let allData = [];
    let start = 0;
    const batchSize = 1000; // Number of rows to fetch per batch
    let batch;

    // Continue fetching data in batches until no more rows are returned
    do {
      const { data, error } = await supabase
        .from('booking_calendar')
        .select('*')
        .range(start, start + batchSize - 1); // Fetch rows from 'start' to 'start + batchSize - 1'

      if (error) {
        console.error('Error fetching calendar data:', error);
        return res.status(500).json({ error: error.message });
      }

      batch = data;
      allData = allData.concat(batch); // Append the batch to the full data array
      start += batchSize; // Move to the next batch
    } while (batch.length === batchSize); // Stop if the batch is smaller than batchSize

    res.json(allData);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});
//used pagination to retrieve all data from database in api/calendar

// Booking endpoint with JWT verification
app.post('/api/calendar/book', authMiddleware, async (req, res) => {
  const { date, peg } = req.body;

  if (!date || !peg) {
    return res.status(400).json({ error: 'Date and peg are required' });
  }

  try {
    // Check if the peg is already booked for the requested date
    const { data: existingBookings, error: checkError } = await supabase
      .from('booking_calendar')
      .select('*')
      .eq('date', date)
      .eq('peg', peg);

    if (checkError) {
      console.error('Error checking existing booking:', checkError);
      return res.status(500).json({ error: checkError.message });
    }

    // If an existing booking is found
    if (existingBookings.length > 0) {
      const currentBooking = existingBookings[0];
      const newStatus =
        currentBooking.status === 'booked' ? 'available' : 'booked';

      // Update booking status for the correct row
      const { error: updateError } = await supabase
        .from('booking_calendar')
        .update({ status: newStatus })
        .eq('id', currentBooking.id);

      if (updateError) {
        console.error('Error updating booking:', updateError);
        return res.status(500).json({ error: updateError.message });
      }
      return res.json({ message: `Booking status updated to ${newStatus}` });
    } else {
      // If no booking exists, create a new one
      const { error: insertError } = await supabase
        .from('booking_calendar')
        .insert([{ date, peg, status: 'booked' }]);

      if (insertError) {
        console.error('Error inserting booking:', insertError);
        return res.status(500).json({ error: insertError.message });
      }
      return res.json({ message: 'Booking created successfully' });
    }
  } catch (error) {
    console.error('Error processing booking:', error);
    return res.status(500).json({ error: error.message });
  }
});

async function clearPastBookings() {
  // Get today's date in the local time zone
  const today = DateTime.local().startOf('day');

  // Format today's date to match Supabase's date format (YYYY-MM-DD)
  const formattedDate = today.toISODate(); // This gets the date in YYYY-MM-DD format

  console.log('Attempting to clear past bookings...');
  console.log('Current date:', formattedDate); // Log the formatted date

  try {
    // Fetch past bookings for debugging
    const { data: pastBookings, error: fetchError } = await supabase
      .from('booking_calendar')
      .select('*')
      .lt('date', formattedDate); // Use formatted date

    if (fetchError) {
      console.error('Error fetching past bookings:', fetchError);
    } else {
      console.log('Past bookings found for deletion:', pastBookings);
    }

    // Proceed to delete if there are past bookings
    if (pastBookings && pastBookings.length > 0) {
      // Delete bookings where the date is less than today
      const { error } = await supabase
        .from('booking_calendar')
        .delete()
        .lt('date', formattedDate); // Use formatted date

      if (error) {
        console.error('Error clearing past bookings:', error);
      } else {
        console.log('Past bookings cleared successfully.');
      }
    } else {
      console.log('No past bookings to clear.');
    }
  } catch (error) {
    console.error('Error processing past bookings:', error);
  }
}

clearPastBookings();
// Schedule the clearPastBookings function to run daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task: clearPastBookings');
  clearPastBookings();
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});*/

// server.js
const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware'); // Ensure this points to your middleware file
const { DateTime } = require('luxon');
const cron = require('node-cron'); // Import node-cron for scheduling

// Load environment variables from .env file
dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: 'https://rbmm2023.github.io/lm-server-client', // Correct client URL
    credentials: true,
  })
);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Root endpoint for basic server verification
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Check if user credentials match .env values
  if (
    email === process.env.FISHERY_OWNER_EMAIL &&
    password === process.env.FISHERY_OWNER_PASSWORD
  ) {
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ message: 'Login successful', token }); // Send token to client
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// Calendar data endpoint with pagination (fetching in batches)
app.get('/api/calendar', async (req, res) => {
  try {
    let allData = [];
    let start = 0;
    const batchSize = 1000; // Number of rows to fetch per batch
    let batch;

    // Continue fetching data in batches until no more rows are returned
    do {
      const { data, error } = await supabase
        .from('booking_calendar')
        .select('*')
        .range(start, start + batchSize - 1); // Fetch rows from 'start' to 'start + batchSize - 1'

      if (error) {
        console.error('Error fetching calendar data:', error);
        return res.status(500).json({ error: error.message });
      }

      batch = data;
      allData = allData.concat(batch); // Append the batch to the full data array
      start += batchSize; // Move to the next batch
    } while (batch.length === batchSize); // Stop if the batch is smaller than batchSize

    res.json(allData);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Booking endpoint with JWT verification (only the fishery owner can book)
app.post('/api/calendar/book', authMiddleware, async (req, res) => {
  const { date, peg } = req.body;

  if (!date || !peg) {
    return res.status(400).json({ error: 'Date and peg are required' });
  }

  try {
    // Check if the peg is already booked for the requested date
    const { data: existingBookings, error: checkError } = await supabase
      .from('booking_calendar')
      .select('*')
      .eq('date', date)
      .eq('peg', peg);

    if (checkError) {
      console.error('Error checking existing booking:', checkError);
      return res.status(500).json({ error: checkError.message });
    }

    // If an existing booking is found
    if (existingBookings.length > 0) {
      const currentBooking = existingBookings[0];
      const newStatus =
        currentBooking.status === 'booked' ? 'available' : 'booked';

      // Update booking status for the correct row
      const { error: updateError } = await supabase
        .from('booking_calendar')
        .update({ status: newStatus })
        .eq('id', currentBooking.id);

      if (updateError) {
        console.error('Error updating booking:', updateError);
        return res.status(500).json({ error: updateError.message });
      }
      return res.json({ message: `Booking status updated to ${newStatus}` });
    } else {
      // If no booking exists, create a new one
      const { error: insertError } = await supabase
        .from('booking_calendar')
        .insert([{ date, peg, status: 'booked' }]);

      if (insertError) {
        console.error('Error inserting booking:', insertError);
        return res.status(500).json({ error: insertError.message });
      }
      return res.json({ message: 'Booking created successfully' });
    }
  } catch (error) {
    console.error('Error processing booking:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Function to clear past bookings daily at midnight
async function clearPastBookings() {
  // Get today's date in the local time zone
  const today = DateTime.local().startOf('day');

  // Format today's date to match Supabase's date format (YYYY-MM-DD)
  const formattedDate = today.toISODate(); // This gets the date in YYYY-MM-DD format

  console.log('Attempting to clear past bookings...');
  console.log('Current date:', formattedDate); // Log the formatted date

  try {
    // Fetch past bookings for debugging
    const { data: pastBookings, error: fetchError } = await supabase
      .from('booking_calendar')
      .select('*')
      .lt('date', formattedDate); // Use formatted date

    if (fetchError) {
      console.error('Error fetching past bookings:', fetchError);
    } else {
      console.log('Past bookings found for deletion:', pastBookings);
    }

    // Proceed to delete if there are past bookings
    if (pastBookings && pastBookings.length > 0) {
      // Delete bookings where the date is less than today
      const { error } = await supabase
        .from('booking_calendar')
        .delete()
        .lt('date', formattedDate); // Use formatted date

      if (error) {
        console.error('Error clearing past bookings:', error);
      } else {
        console.log('Past bookings cleared successfully.');
      }
    } else {
      console.log('No past bookings to clear.');
    }
  } catch (error) {
    console.error('Error processing past bookings:', error);
  }
}

clearPastBookings();

// Schedule the clearPastBookings function to run daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task: clearPastBookings');
  clearPastBookings();
});

//Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on https://lm-server-server.onrender.com/`);
});
