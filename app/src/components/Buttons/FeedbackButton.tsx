import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  Tooltip,
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Rating,
  Divider,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const Feedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [feedback, setFeedback] = useState({
    rating: 0,
    subject: '',
    message: '',
    email: ''
  });

  const handleToggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const templateParams = {
        from_email: feedback.email,
        subject: feedback.subject || 'Website Feedback',
        message: feedback.message,
        rating: feedback.rating || null,
        to_email: 'twnetshsu@gmail.com'
      };

      await emailjs.send(
        'twnetshsu@gmail.com',    
        'template_3drd9ps',  
        templateParams,
        'I-XNpvqlYRo-aYnWT'     
      );

      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFeedback({
          rating: 0,
          subject: '',
          message: '',
          email: ''
        });
        setIsOpen(false);
        setSubmitStatus(null);
      }, 2000);

    } catch (error) {
      console.error('Failed to send feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFeedback(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setFeedback(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  return (
    <>
      {/* Feedback Button */}
      <Tooltip title="Email us your feedback." arrow placement="left">
        <button
          onClick={handleToggleDrawer}
          className="fixed text-sm right-0 -mr-6 top-1/2 -rotate-90 px-3 py-3 bg-[#124559] hover:bg-white text-white hover:text-[#124559] hover:border-2 hover:border-[#124559] transition-all duration-300 rounded-t-lg z-50"
          aria-label="Feedback"
        >
          Feedback
        </button>
      </Tooltip>

      {/* Slide-out Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleToggleDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            backgroundColor: '#f8f9fa'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" component="h2" sx={{ color: '#124559', fontWeight: 'bold' }}>
              We'd love your feedback!
            </Typography>
            <IconButton onClick={handleToggleDrawer} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Feedback Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Thank you! Your feedback has been sent successfully.
              </Alert>
            )}
            {submitStatus === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Sorry, there was an error sending your feedback. Please try again.
              </Alert>
            )}
            {/* Rating */}
            <Box sx={{ mb: 3 }}>
              <Typography component="legend" sx={{ mb: 1, fontWeight: 'medium' }}>
                How would you rate your experience? (Optional)
              </Typography>
              <Rating
                name="rating"
                value={feedback.rating}
                onChange={handleRatingChange}
                size="large"
              />
            </Box>

            {/* Email */}
            <TextField
              fullWidth
              label="Your Email"
              variant="outlined"
              type="email"
              value={feedback.email}
              onChange={handleInputChange('email')}
              sx={{ mb: 2 }}
              helperText="We'll only use this to follow up if needed"
              required
            />

            {/* Subject */}
            <TextField
              fullWidth
              label="Subject"
              variant="outlined"
              value={feedback.subject}
              onChange={handleInputChange('subject')}
              sx={{ mb: 2 }}
              placeholder="Brief description of your feedback"
              required
            />

            {/* Message */}
            <TextField
              fullWidth
              label="Your Feedback"
              variant="outlined"
              multiline
              rows={6}
              value={feedback.message}
              onChange={handleInputChange('message')}
              sx={{ mb: 3, flexGrow: 1 }}
              placeholder="Tell us what you think! What's working well? What could be improved?"
              required
            />

            <Divider sx={{ mb: 3 }} />
            <Typography variant="body2" sx={{ mb: 2, color: '#6c757d' }}>
                Alternatively, you can email your feedback directly to Colin McDonald at Colin@texaswater.org.
            </ Typography>
            
            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              sx={{
                backgroundColor: '#124559',
                '&:hover': {
                  backgroundColor: '#0f3a4a'
                },
                py: 1.5,
                mt: 'auto'
              }}
              disabled={!feedback.message.trim() || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Feedback;