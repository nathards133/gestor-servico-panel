import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    Typography,
    IconButton,
    Box,
    Tabs,
    Tab,
    Paper,
    InputAdornment,
    FormControlLabel,
    Switch
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { NumericFormat } from 'react-number-format';
import api from '../config/axios';

// Definindo as constantes dentro do componente
const ORDER_SOURCES = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'web', label: 'Web' },
    { value: 'manual', label: 'Manual' },
    { value: 'outros', label: 'Outros' }
];

const PRINT_TYPES = [
    { value: 'banner', label: 'Banner' },
    { value: 'adesivo', label: 'Adesivo' },
    { value: 'placa', label: 'Placa' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'fachada', label: 'Fachada' },
    { value: 'adesivo-recorte', label: 'Adesivo Recorte' },
    { value: 'letras-caixa', label: 'Letras Caixa' },
    { value: 'outros', label: 'Outros' }
];

const PREDEFINED_SIZES = [
    { value: 'a4', label: 'A4 (21x29,7cm)', width: 21, height: 29.7 },
    { value: 'a3', label: 'A3 (29,7x42cm)', width: 29.7, height: 42 },
    { value: '1x1', label: '1x1 metro', width: 100, height: 100 },
    { value: '2x1', label: '2x1 metros', width: 200, height: 100 },
    { value: '3x1', label: '3x1 metros', width: 300, height: 100 },
    { value: 'custom', label: 'Personalizado', width: '', height: '' }
];

// Componente TabPanel
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ServiceOrderDialog = ({ open, onClose, onSave, order, mode }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({
        clientId: '',
        expectedCompletionDate: null,
        orderSource: '',
        description: '',
        items: [{
            printType: '',
            size: 'custom',
            width: '',
            height: '',
            quantity: 1,
            material: '',
            finishing: [],
            requiresInstallation: false,
            unitValue: '',
            observations: ''
        }],
        artFile: null,
        artPreview: null,
        cep: '',
        deliveryAddress: '',
        deliveryNumber: '',
        paymentMethod: '',
        status: 'pending',
        artApprovalStatus: 'pending',
        productionStartDate: null,
        productionSteps: [],
        deliveryDate: null,
        deliveryStatus: 'pending',
        productionCost: 0,
        serviceValue: 0,
        discount: 0,
        paymentStatus: 'pending',
        internalNotes: '',
        interactionHistory: [],
        updateHistory: []
    });
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await api.get('/api/clients');
                setClients(response.data);
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                setError('Falha ao carregar lista de clientes');
            }
        };
        fetchClients();
    }, []);

    useEffect(() => {
        if (order && mode === 'edit') {
            setFormData({
                ...order,
                items: order.items || [],
                productionSteps: order.productionSteps || [],
                interactionHistory: order.interactionHistory || [],
                updateHistory: order.updateHistory || []
            });
        }
    }, [order, mode]);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/api/services');
            setServices(response.data);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
            return { ...prev, items: newItems };
        });
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                printType: '',
                size: 'custom',
                width: '',
                height: '',
                quantity: 1,
                material: '',
                finishing: [],
                requiresInstallation: false,
                unitValue: '',
                observations: ''
            }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            if (!formData.clientId) {
                setError('Selecione um cliente');
                return;
            }
            if (!formData.expectedCompletionDate) {
                setError('Defina uma data prevista de conclusão');
                return;
            }
            if (formData.items.length === 0) {
                setError('Adicione pelo menos um item');
                return;
            }

            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar OS:', error);
            setError('Falha ao salvar OS');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Criar preview
            const preview = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                artFile: file,
                artPreview: preview
            }));
        }
    };

    const handleCepSearch = async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    deliveryAddress: `${data.logradouro}, ${data.bairro}, ${data.localidade}/${data.uf}`
                }));
            } else {
                setError('CEP não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setError('Erro ao buscar CEP');
        }
    };

    const handleServiceSelect = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setSelectedService(service);
            // Atualizar o formulário com base nas características do serviço
            setFormData(prev => ({
                ...prev,
                serviceId: serviceId,
                items: [{
                    ...prev.items[0],
                    requiresDimensions: service.requires_dimensions,
                    requiresMaterial: service.requires_material,
                    requiresFinishing: service.requires_finishing,
                    requiresInstallation: service.requires_installation,
                    materials: service.materials || [],
                    finishingOptions: service.finishing_options || []
                }]
            }));
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderAttributeField = (attribute) => {
        switch (attribute.type) {
            case 'text':
                return (
                    <TextField
                        fullWidth
                        label={attribute.label}
                        value={formData[attribute.name] || ''}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [attribute.name]: e.target.value
                        }))}
                    />
                );
            case 'number':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        label={attribute.label}
                        value={formData[attribute.name] || ''}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [attribute.name]: e.target.value
                        }))}
                    />
                );
            case 'select':
                return (
                    <TextField
                        fullWidth
                        select
                        label={attribute.label}
                        value={formData[attribute.name] || ''}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [attribute.name]: e.target.value
                        }))}
                    >
                        {attribute.options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                );
            case 'boolean':
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData[attribute.name] || false}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    [attribute.name]: e.target.checked
                                }))}
                            />
                        }
                        label={attribute.label}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {mode === 'edit' ? 'Editar OS' : 'Nova Ordem de Serviço'}
            </DialogTitle>
            <DialogContent>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Informações Básicas" />
                    <Tab label="Itens do Pedido" />
                    <Tab label="Arte e Aprovação" />
                    <Tab label="Entrega e Pagamento" />
                </Tabs>

                {/* Conteúdo das abas */}
                <TabPanel value={activeTab} index={0}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Cliente"
                                name="clientId"
                                value={formData.clientId}
                                onChange={handleChange}
                                error={error === 'Selecione um cliente'}
                                helperText={error === 'Selecione um cliente' ? error : ''}
                                required
                            >
                                {clients.map((client) => (
                                    <MenuItem key={client.id} value={client.id}>
                                        {client.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Data Prevista de Conclusão"
                                value={formData.expectedCompletionDate}
                                onChange={(date) => setFormData(prev => ({ ...prev, expectedCompletionDate: date }))}
                                format="dd/MM/yyyy"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: error === 'Defina uma data prevista de conclusão',
                                        helperText: error === 'Defina uma data prevista de conclusão' ? error : ''
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Origem do Pedido"
                                name="orderSource"
                                value={formData.orderSource}
                                onChange={handleChange}
                                required
                            >
                                {ORDER_SOURCES.map((source) => (
                                    <MenuItem key={source.value} value={source.value}>
                                        {source.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                placeholder="Descreva os detalhes gerais do pedido..."
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Selecionar Serviço"
                                value={formData.serviceId || ''}
                                onChange={(e) => handleServiceSelect(e.target.value)}
                            >
                                {services.map((service) => (
                                    <MenuItem key={service.id} value={service.id}>
                                        {service.name} - {service.category?.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    {formData.items.map((item, index) => (
                        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                                {/* Campos específicos do serviço selecionado */}
                                {selectedService?.attributes?.map((attr) => (
                                    <Grid item xs={12} sm={6} key={attr.id}>
                                        {renderAttributeField(attr)}
                                    </Grid>
                                ))}
                                
                                {/* Campos padrão do item */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Quantidade"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                    
                    <Button
                        startIcon={<AddIcon />}
                        onClick={addItem}
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Adicionar Item
                    </Button>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <Grid container spacing={2}>
                        {/* Visualização e Upload da Arte */}
                        <Grid item xs={12}>
                            <Box 
                                sx={{ 
                                    border: '2px dashed #ccc',
                                    borderRadius: 1,
                                    p: 3,
                                    textAlign: 'center',
                                    mb: 2,
                                    cursor: 'pointer',
                                    '&:hover': { borderColor: 'primary.main' }
                                }}
                                onClick={() => document.getElementById('art-upload').click()}
                            >
                                {formData.artPreview ? (
                                    <Box>
                                        <img 
                                            src={formData.artPreview} 
                                            alt="Preview da Arte"
                                            style={{ maxWidth: '100%', maxHeight: '200px' }}
                                        />
                                        <Typography variant="caption" display="block">
                                            Clique para alterar a arte
                                        </Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                                        <Typography>
                                            Clique para fazer upload da arte
                                        </Typography>
                                    </>
                                )}
                            </Box>
                            <input
                                type="file"
                                id="art-upload"
                                accept="image/*,.pdf"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                        </Grid>

                        {/* Status da Aprovação */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Status da Aprovação da Arte"
                                name="artApprovalStatus"
                                value={formData.artApprovalStatus}
                                onChange={handleChange}
                            >
                                <MenuItem value="pending">Pendente</MenuItem>
                                <MenuItem value="approved">Aprovado pelo Cliente</MenuItem>
                                <MenuItem value="revision">Revisão Necessária</MenuItem>
                                <MenuItem value="rejected">Rejeitado</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Observações sobre a Arte */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Observações sobre a Arte"
                                name="artObservations"
                                value={formData.artObservations}
                                onChange={handleChange}
                                placeholder="Detalhes sobre alterações necessárias, feedback do cliente, etc."
                            />
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                    <Grid container spacing={2}>
                        {/* CEP e Endereço */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="CEP"
                                name="cep"
                                value={formData.cep}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setFormData(prev => ({ ...prev, cep: value }));
                                    if (value.length === 8) {
                                        handleCepSearch(value);
                                    }
                                }}
                                inputProps={{ maxLength: 8 }}
                                placeholder="00000000"
                            />
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Endereço"
                                name="deliveryAddress"
                                value={formData.deliveryAddress}
                                onChange={handleChange}
                                InputProps={{
                                    readOnly: true
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Número"
                                name="deliveryNumber"
                                value={formData.deliveryNumber}
                                onChange={handleChange}
                                placeholder="Ex: 123"
                            />
                        </Grid>

                        {/* Forma de Pagamento */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Forma de Pagamento"
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            >
                                <MenuItem value="pix">PIX</MenuItem>
                                <MenuItem value="dinheiro">Dinheiro</MenuItem>
                                <MenuItem value="cartao">Cartão</MenuItem>
                                <MenuItem value="boleto">Boleto</MenuItem>
                                <MenuItem value="transferencia">Transferência</MenuItem>
                                <MenuItem value="online">Pagamento Online</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Valores */}
                        <Grid item xs={12} sm={6}>
                            <NumericFormat
                                customInput={TextField}
                                fullWidth
                                label="Valor do Serviço"
                                name="serviceValue"
                                value={formData.serviceValue}
                                onValueChange={(values) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        serviceValue: values.floatValue || 0
                                    }));
                                }}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="R$ "
                                decimalScale={2}
                                fixedDecimalScale
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <NumericFormat
                                customInput={TextField}
                                fullWidth
                                label="Desconto"
                                name="discount"
                                value={formData.discount}
                                onValueChange={(values) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        discount: values.floatValue || 0
                                    }));
                                }}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="R$ "
                                decimalScale={2}
                                fixedDecimalScale
                            />
                        </Grid>
                    </Grid>
                </TabPanel>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServiceOrderDialog; 