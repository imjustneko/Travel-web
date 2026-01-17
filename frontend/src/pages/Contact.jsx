// frontend/src/pages/Contact.jsx
function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', message: ''
  });
  const [status, setStatus] = useState('idle');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await axios.post('/api/contact', formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" loading={status === 'loading'}>
        Send Message
      </Button>
      {status === 'success' && <p>Message sent!</p>}
    </form>
  );
}