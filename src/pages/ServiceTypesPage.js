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
    Chip,
    MenuItem,
    Switch,
    FormControlLabel,
    Tooltip,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    HelpOutline as HelpIcon,
    InfoOutlined as InfoIcon
} from '@mui/icons-material';
import api from '../config/axios';

const ServiceTypesPage = () => {
    const [types, setTypes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        attributes: []
    });

    const helpTexts = {
        serviceType: "Tipos de serviço são categorias gerais que definem as características e atributos comuns para um determinado tipo de negócio.",
        name: "Nome único que identifica este tipo de serviço (ex: 'Serviço de Impressão', 'Consultoria')",
        description: "Descrição detalhada do tipo de serviço e suas características principais",
        attributes: "Atributos são campos personalizados que cada serviço deste tipo precisará preencher",
        attributeName: "Identificador único do atributo (usado internamente)",
        attributeLabel: "Nome de exibição do atributo para os usuários",
        attributeType: "Tipo de dado que este atributo irá armazenar",
        defaultValue: "Valor padrão quando um novo serviço for criado",
        required: "Define se este atributo é obrigatório para todos os serviços deste tipo",
        options: "Lista de opções disponíveis para seleção (apenas para tipo 'select')"
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const response = await api.get('/api/service-types');
            setTypes(response.data);
        } catch (error) {
            console.error('Erro ao buscar tipos:', error);
            setSnackbar({ open: true, message: 'Erro ao carregar tipos de serviço', severity: 'error' });
        }
    };

    const handleOpenDialog = (type = null) => {
        if (type) {
            setSelectedType(type);
            setFormData({
                name: type.name,
                description: type.description,
                attributes: type.attributes || []
            });
        } else {
            setSelectedType(null);
            setFormData({
                name: '',
                description: '',
                attributes: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedType(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddAttribute = () => {
        setFormData(prev => ({
            ...prev,
            attributes: [...prev.attributes, {
                name: '',
                label: '',
                type: 'text',
                required: false,
                options: [],
                default_value: ''
            }]
        }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedType) {
                await api.put(`/api/service-types/${selectedType.id}`, formData);
                setSnackbar({ open: true, message: 'Tipo de serviço atualizado com sucesso', severity: 'success' });
            } else {
                await api.post('/api/service-types', formData);
                setSnackbar({ open: true, message: 'Tipo de serviço criado com sucesso', severity: 'success' });
            }
            handleCloseDialog();
            fetchTypes();
        } catch (error) {
            console.error('Erro ao salvar tipo de serviço:', error);
            setSnackbar({ open: true, message: 'Erro ao salvar tipo de serviço', severity: 'error' });
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5">Tipos de Serviço</Typography>
                    <Tooltip title={helpTexts.serviceType}>
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Novo Serviço
                </Button>
            </Box>

            <Grid container spacing={3}>
                {types.map((type) => (
                    <Grid item xs={12} sm={6} md={4} key={type.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">{type.name}</Typography>
                                    <Box>
                                        <IconButton onClick={() => handleOpenDialog(type)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography color="textSecondary" gutterBottom>
                                    {type.description}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {type.attributes?.map((attr) => (
                                        <Chip
                                            key={attr.id}
                                            label={attr.label}
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {selectedType ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço'}
                        </Typography>
                        <Tooltip title={helpTexts.serviceType}>
                            <IconButton size="small" sx={{ ml: 1 }}>
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Box sx={{ mb: 2 }}>
                            <Tooltip title={helpTexts.name} placement="top-start">
                                <TextField
                                    fullWidth
                                    label="Nome"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <InfoIcon color="action" fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Tooltip>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Tooltip title={helpTexts.description} placement="top-start">
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Descrição"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <InfoIcon color="action" fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Tooltip>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Atributos</Typography>
                            <Tooltip title={helpTexts.attributes}>
                                <IconButton size="small" sx={{ ml: 1 }}>
                                    <InfoIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {formData.attributes.map((attr, index) => (
                            <Box key={index} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Tooltip title={helpTexts.attributeName}>
                                            <TextField
                                                fullWidth
                                                label="Nome do Atributo"
                                                value={attr.name}
                                                onChange={(e) => {
                                                    const newAttributes = [...formData.attributes];
                                                    newAttributes[index].name = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        attributes: newAttributes
                                                    }));
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <InfoIcon color="action" fontSize="small" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Label de Exibição"
                                            value={attr.label}
                                            onChange={(e) => {
                                                const newAttributes = [...formData.attributes];
                                                newAttributes[index].label = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    attributes: newAttributes
                                                }));
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Tipo"
                                            value={attr.type}
                                            onChange={(e) => {
                                                const newAttributes = [...formData.attributes];
                                                newAttributes[index].type = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    attributes: newAttributes
                                                }));
                                            }}
                                        >
                                            <MenuItem value="text">Texto</MenuItem>
                                            <MenuItem value="number">Número</MenuItem>
                                            <MenuItem value="select">Seleção</MenuItem>
                                            <MenuItem value="boolean">Sim/Não</MenuItem>
                                            <MenuItem value="date">Data</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Valor Padrão"
                                            value={attr.default_value}
                                            onChange={(e) => {
                                                const newAttributes = [...formData.attributes];
                                                newAttributes[index].default_value = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    attributes: newAttributes
                                                }));
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={attr.required}
                                                    onChange={(e) => {
                                                        const newAttributes = [...formData.attributes];
                                                        newAttributes[index].required = e.target.checked;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            attributes: newAttributes
                                                        }));
                                                    }}
                                                />
                                            }
                                            label="Obrigatório"
                                        />
                                    </Grid>
                                    {attr.type === 'select' && (
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Opções (separadas por vírgula)"
                                                value={Array.isArray(attr.options) ? attr.options.join(', ') : ''}
                                                onChange={(e) => {
                                                    const newAttributes = [...formData.attributes];
                                                    newAttributes[index].options = e.target.value.split(',').map(opt => opt.trim());
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        attributes: newAttributes
                                                    }));
                                                }}
                                                helperText="Ex: Opção 1, Opção 2, Opção 3"
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <IconButton
                                            color="error"
                                            onClick={() => {
                                                const newAttributes = formData.attributes.filter((_, i) => i !== index);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    attributes: newAttributes
                                                }));
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddAttribute}
                            variant="outlined"
                            fullWidth
                        >
                            Adicionar Atributo
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedType ? 'Atualizar' : 'Criar'}
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

export default ServiceTypesPage; 