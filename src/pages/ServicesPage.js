import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Dialog,
    TextField,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormControlLabel,
    Switch,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../config/axios';

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        attributes: []
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/api/services');
            setServices(response.data);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            showSnackbar('Erro ao carregar serviços', 'error');
        }
    };

    const handleOpenDialog = (service = null) => {
        if (service) {
            setSelectedService(service);
            setFormData({
                name: service.name || '',
                description: service.description || '',
                basePrice: service.base_price || '',
                attributes: Array.isArray(service.attributes) ? service.attributes : []
            });
        } else {
            setSelectedService(null);
            setFormData({
                name: '',
                description: '',
                basePrice: '',
                attributes: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedService(null);
    };

    const handleSubmit = async () => {
        try {
            if (selectedService) {
                await api.put(`/api/services/${selectedService.id}`, formData);
                showSnackbar('Serviço atualizado com sucesso');
            } else {
                await api.post('/api/services', formData);
                showSnackbar('Serviço criado com sucesso');
            }
            handleCloseDialog();
            fetchServices();
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            showSnackbar('Erro ao salvar serviço', 'error');
        }
    };

    const handleDelete = async (serviceId) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                await api.delete(`/api/services/${serviceId}`);
                showSnackbar('Serviço excluído com sucesso');
                fetchServices();
            } catch (error) {
                console.error('Erro ao excluir serviço:', error);
                showSnackbar('Erro ao excluir serviço', 'error');
            }
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCustomAttributeChange = (newAttributes) => {
        setFormData(prev => ({
            ...prev,
            attributes: newAttributes
        }));
    };

    const CustomAttributes = ({ attributes = [], onChange }) => {
        const [attributeList, setAttributeList] = useState(Array.isArray(attributes) ? attributes : []);

        const handleAddAttribute = () => {
            setAttributeList(prevList => [...prevList, {
                name: '',
                label: '',
                type: 'text',
                required: false,
                options: []
            }]);
        };

        const handleAttributeChange = (index, field, value) => {
            const newAttributes = [...attributeList];
            newAttributes[index][field] = value;
            setAttributeList(newAttributes);
            onChange(newAttributes);
        };

        const handleRemoveAttribute = (index) => {
            const newAttributes = attributeList.filter((_, i) => i !== index);
            setAttributeList(newAttributes);
            onChange(newAttributes);
        };

        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Perguntas do Serviço</Typography>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddAttribute}
                        variant="outlined"
                    >
                        Adicionar Pergunta
                    </Button>
                </Box>

                {attributeList.map((attr, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Pergunta"
                                    value={attr.label || ''}
                                    onChange={(e) => handleAttributeChange(index, 'label', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Tipo de Resposta</InputLabel>
                                    <Select
                                        value={attr.type || 'text'}
                                        onChange={(e) => handleAttributeChange(index, 'type', e.target.value)}
                                        label="Tipo de Resposta"
                                    >
                                        <MenuItem value="text">Texto</MenuItem>
                                        <MenuItem value="number">Número</MenuItem>
                                        <MenuItem value="select">Múltipla Escolha</MenuItem>
                                        <MenuItem value="boolean">Sim/Não</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={attr.required || false}
                                            onChange={(e) => handleAttributeChange(index, 'required', e.target.checked)}
                                        />
                                    }
                                    label="Resposta Obrigatória"
                                />
                            </Grid>
                            {attr.type === 'select' && (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Opções (separadas por vírgula)"
                                        value={Array.isArray(attr.options) ? attr.options.join(', ') : ''}
                                        onChange={(e) => handleAttributeChange(
                                            index,
                                            'options',
                                            e.target.value.split(',').map(opt => opt.trim())
                                        )}
                                        helperText="Ex: Opção 1, Opção 2, Opção 3"
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveAttribute(index)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </Box>
        );
    };

    const renderServiceDetails = (service) => {
        return (
            <>
                {service.attributes?.map((attr, index) => (
                    <Typography key={index} variant="body2">
                        {attr.label}: {formatAttributeValue(attr.value, attr)}
                    </Typography>
                ))}
            </>
        );
    };

    const formatAttributeValue = (value, attribute) => {
        if (!value) return '-';

        switch (attribute.type) {
            case 'boolean':
                return value ? 'Sim' : 'Não';
            case 'number':
                return value.toString();
            default:
                return value;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Meus Serviços</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Novo Serviço
                </Button>
            </Box>

            <Grid container spacing={3}>
                {services.map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">{service.name}</Typography>
                                    <Box>
                                        <IconButton onClick={() => handleOpenDialog(service)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(service.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography color="textSecondary" gutterBottom>
                                    {service.description}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                {renderServiceDetails(service)}
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(service.base_price)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Nome do Serviço"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Descrição"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Preço Base"
                            value={formData.basePrice}
                            onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                            InputProps={{
                                startAdornment: <span>R$</span>
                            }}
                            sx={{ mb: 3 }}
                        />

                        <CustomAttributes
                            attributes={formData.attributes}
                            onChange={handleCustomAttributeChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedService ? 'Atualizar' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ServicesPage;