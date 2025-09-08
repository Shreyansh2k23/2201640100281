// src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { log } from 'logging-middleware'; // Your logger

// --- MUI Components ---
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Stack, 
  Alert 
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton'; // A button with a loading state
import LinkIcon from '@mui/icons-material/Link'; // An icon

const BACKEND_URL = 'http://localhost:3000';

function App() {
  const [url, setUrl] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortLink('');

    log('frontend', 'info', 'component', `User attempting to shorten URL: ${url}`);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/shorturls`, { url });
      setShortLink(response.data.shortLink);
      log('frontend', 'info', 'api', `Successfully created short link: ${response.data.shortLink}`);
    } catch (err) {
      const errorMessage = err.response ? err.response.data.error : 'Server is not running';
      setError(errorMessage);
      log('frontend', 'error', 'api', `Failed to create short link: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}
    >
      <Card sx={{ minWidth: 400, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              URL Shortener
            </Typography>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  label="Enter a long URL"
                  variant="outlined"
                  type="url"
                  fullWidth
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<LinkIcon />}
                >
                  Shorten URL
                </LoadingButton>
              </Stack>
            </form>

            {shortLink && (
              <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
                Success! Your link: <a href={shortLink} target="_blank" rel="noopener noreferrer">{shortLink}</a>
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                {error}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;