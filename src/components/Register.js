import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TextField, Button, Box, Typography, Alert, Grid, CircularProgress } from '@mui/material';
import loginImage from '../login3.jpg';
import logoImage from '../logo.png';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        try {
            await register(
                formData.email,
                formData.password,
                {
                    companyName: formData.companyName
                }
            );
        } catch (error) {
            setError(error.message || 'Erro ao registrar usuário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container sx={{ height: '100vh' }}>
            <Grid item xs={12} sm={6} md={5} component={Box} sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 4,
                margin: 'auto' 
            }}>
                <Typography component="h3" variant="h4" sx={{ mb: 4 }}>
                    Criar nova conta
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Senha"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirmar Senha"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="companyName"
                        label="Nome da Empresa"
                        value={formData.companyName}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, height: 56 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
                    </Button>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>
                <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                        <img src={logoImage} alt="Logo da empresa" style={{ maxWidth: 76 }} />
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={false} sm={6} md={7} sx={{
                backgroundImage: `url(${loginImage})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }} />
        </Grid>
    );
};

export default Register; 