
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/api/r/:subreddit', async (req, res) => {
  const { subreddit } = req.params;

  try {
    // use an explicit, realistic User-Agent — Reddit often blocks empty/default UAs
    const response = await axios.get(`https://www.reddit.com/r/${subreddit}.json`, {
      headers: {
        'User-Agent': 'bastet-app/1.0 (+https://github.com/Sleetherin/bastet)'
      },
      timeout: 10000, // 10s
      responseType: 'json',
    });

    // forward the JSON exactly as received
    return res.json(response.data);
  } catch (error) {
    // Detailed logging for debugging
    console.error('--- Error fetching Reddit ---');
    console.error('Requested URL:', `https://www.reddit.com/r/${subreddit}.json`);
    console.error('Error message:', error.message);

    if (error.response) {
      // The request was made and server responded with non-2xx
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      // log a small part of body to avoid huge logs
      console.error('Response data (truncated):', JSON.stringify(error.response.data).slice(0, 1000));
      // forward status and some details to client
      return res.status(error.response.status).json({
        error: 'Reddit responded with an error',
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response received
      console.error('No response received. Request:', error.request);
      return res.status(504).json({ error: 'No response from Reddit (timeout or network issue)' });
    } else {
      // Something else went wrong
      console.error('Unknown error:', error.stack || error);
      return res.status(500).json({ error: 'Server error when fetching Reddit', details: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});