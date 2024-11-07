import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert, Grid, Checkbox, FormControlLabel, Divider, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import loginImage from '../login3.jpg';
import logoImage from '../logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        if (email && password) {
            try {
                await login(email, password);
                navigate('/');
            } catch (error) {
                setError(error.message || 'Falha no login. Verifique suas credenciais.');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Por favor, preencha todos os campos');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            setError('Erro ao fazer login com Google');
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
                    Acesse sua conta!
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Senha"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                        label="Lembrar-me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, height: 56 }}
                        disabled={!email || !password || loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Entrar com Google'}
                    </Button>
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ flexGrow: 1 }} />
                    <Divider sx={{ my: 2 }} />
                    
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                        <img src={logoImage} alt="Logo da empresa" style={{ maxWidth: 76 }} />
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

export default Login;
