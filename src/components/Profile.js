import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Avatar,
  MenuItem
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/axios';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    company: {
      name: '',
      cnpj: '',
      phone: '',
      logo: null,
      description: '',
      chatbotInfo: '',
      address: {
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    business_type: '',
    nfe_config: {
      ambiente: 'homologacao',
      serie: '1',
      numero_inicial: 1
    }
  });

  const businessTypes = [
    { value: 'mei', label: 'Microempreendedor Individual (MEI)' },
    { value: 'me', label: 'Microempresa (ME)' }
  ];

  const [imageLoading, setImageLoading] = useState(false);

  const handleCNPJChange = async (e) => {
    const cnpj = e.target.value;
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        cnpj
      }
    }));

    if (cnpj.length === 14) {
      try {
        const response = await api.get(`/api/users/cnpj/${cnpj}`);
        const { endereco } = response.data;
        
        setFormData(prev => ({
          ...prev,
          company: {
            ...prev.company,
            address: {
              street: endereco.logradouro,
              district: endereco.bairro,
              city: endereco.cidade,
              state: endereco.estado,
              zipCode: endereco.cep,
              number: '',
              complement: ''
            }
          }
        }));
      } catch (error) {
        setError('Erro ao buscar dados do CNPJ');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageLoading(true);
      setError('');
      setSuccess('');
      try {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await api.post('/api/users/upload-logo', formData);
        setFormData(prev => ({
          ...prev,
          company: {
            ...prev.company,
            logo: response.data.logoUrl
          }
        }));
        setSuccess('Imagem carregada com sucesso!');
        setUser(prev => ({
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            company: {
              ...prev.user_metadata.company,
              logo: response.data.logoUrl
            }
          }
        }));
      } catch (error) {
        setError('Erro ao fazer upload da imagem');
      } finally {
        setImageLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        address: {
          ...prev.company.address,
          [name]: value
        }
      }
    }));
  };

  const handleCEPBlur = async () => {
    const cep = formData.company.address.zipCode;
    if (cep.length === 8) {
      try {
        const response = await api.get(`/api/users/cnpj/${cep}`);
        const { endereco } = response.data;

        setFormData(prev => ({
          ...prev,
          company: {
            ...prev.company,
            address: {
              street: endereco.logradouro,
              district: endereco.bairro,
              city: endereco.cidade,
              state: endereco.estado,
              zipCode: endereco.cep,
              number: '',
              complement: ''
            }
          }
        }));
      } catch (error) {
        setError('Erro ao buscar dados do CEP');
      }
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await api.get('/api/users/profile');
        const userData = response.data;
        
        setFormData({
          company: {
            name: userData.user.user_metadata?.company?.name || '',
            cnpj: userData.user.user_metadata?.company?.cnpj || '',
            phone: userData.user.user_metadata?.company?.phone || '',
            logo: userData.user.user_metadata?.company?.logo || null,
            description: userData.user.user_metadata?.company?.description || '',
            chatbotInfo: userData.user.user_metadata?.company?.chatbotInfo || '',
            address: {
              street: userData.user.user_metadata?.company?.address?.street || '',
              number: userData.user.user_metadata?.company?.address?.number || '',
              complement: userData.user.user_metadata?.company?.address?.complement || '',
              district: userData.user.user_metadata?.company?.address?.district || '',
              city: userData.user.user_metadata?.company?.address?.city || '',
              state: userData.user.user_metadata?.company?.address?.state || '',
              zipCode: userData.user.user_metadata?.company?.address?.zipCode || ''
            }
          },
          business_type: userData.user.user_metadata?.business_type || '',
          nfe_config: {
            ambiente: userData.user.user_metadata?.nfe_config?.ambiente || 'homologacao',
            serie: userData.user.user_metadata?.nfe_config?.serie || '1',
            numero_inicial: userData.user.user_metadata?.nfe_config?.numero_inicial || 1
          }
        });
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setError('Erro ao carregar dados do usuário');
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (user?.user_metadata) {
      setFormData({
        company: {
          name: user.user_metadata.company?.name || '',
          cnpj: user.user_metadata.company?.cnpj || '',
          phone: user.user_metadata.company?.phone || '',
          logo: user.user_metadata.company?.logo || null,
          description: user.user_metadata.company?.description || '',
          chatbotInfo: user.user_metadata.company?.chatbotInfo || '',
          address: {
            street: user.user_metadata.company?.address?.street || '',
            number: user.user_metadata.company?.address?.number || '',
            complement: user.user_metadata.company?.address?.complement || '',
            district: user.user_metadata.company?.address?.district || '',
            city: user.user_metadata.company?.address?.city || '',
            state: user.user_metadata.company?.address?.state || '',
            zipCode: user.user_metadata.company?.address?.zipCode || ''
          }
        },
        business_type: user.user_metadata.business_type || '',
        nfe_config: {
          ambiente: user.user_metadata.nfe_config?.ambiente || 'homologacao',
          serie: user.user_metadata.nfe_config?.serie || '1',
          numero_inicial: user.user_metadata.nfe_config?.numero_inicial || 1
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/api/users/profile', formData);
      setUser({
        ...user,
        ...response.data.user_metadata
      });
      setSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Dados Básicos" />
          <Tab label="Endereço" />
          <Tab label="Configurações" />
        </Tabs>
      </Box>

      <form onSubmit={handleSubmit}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={formData.company.logo}
                  sx={{ width: 100, height: 100 }}
                />
                <IconButton
                  color="primary"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white'
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  {imageLoading ? <CircularProgress size={24} /> : <PhotoCamera />}
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome da Empresa"
                name="company.name"
                value={formData.company.name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CNPJ"
                name="company.cnpj"
                value={formData.company.cnpj}
                onChange={handleCNPJChange}
                inputProps={{ maxLength: 14 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Empresa"
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
              >
                {businessTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="company.phone"
                value={formData.company.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descrição da Empresa"
                name="company.description"
                value={formData.company.description}
                onChange={handleChange}
                helperText="Descreva sua empresa, seus serviços e diferenciais"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Informações para Chatbot"
                name="company.chatbotInfo"
                value={formData.company.chatbotInfo}
                onChange={handleChange}
                helperText="Informações adicionais para treinamento do chatbot"
              />
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Endereço
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CEP"
                name="zipCode"
                value={formData.company.address.zipCode}
                onChange={handleAddressChange}
                onBlur={handleCEPBlur}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rua"
                name="street"
                value={formData.company.address.street}
                onChange={handleAddressChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Número"
                name="number"
                value={formData.company.address.number}
                onChange={handleAddressChange}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Complemento"
                name="complement"
                value={formData.company.address.complement}
                onChange={handleAddressChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bairro"
                name="district"
                value={formData.company.address.district}
                onChange={handleAddressChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cidade"
                name="city"
                value={formData.company.address.city}
                onChange={handleAddressChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estado"
                name="state"
                value={formData.company.address.state}
                onChange={handleAddressChange}
              />
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ambiente"
                name="nfe_config.ambiente"
                value={formData.nfe_config.ambiente}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Série"
                name="nfe_config.serie"
                value={formData.nfe_config.serie}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número Inicial"
                name="nfe_config.numero_inicial"
                value={formData.nfe_config.numero_inicial}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </form>
    </Paper>
  );
};

export default Profile;