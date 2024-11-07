import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

const ClientDialog = ({ open, onClose, onSave, client, mode }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: {
            street: '',
            number: '',
            complement: '',
            district: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });
    const [tabValue, setTabValue] = useState(0);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (client && (mode === 'edit' || mode === 'view')) {
            setFormData(client);
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                document: '',
                address: {
                    street: '',
                    number: '',
                    complement: '',
                    district: '',
                    city: '',
                    state: '',
                    zipCode: ''
                }
            });
        }
    }, [client, mode]);

    useEffect(() => {
        if (client?.id && mode === 'view') {
            fetchServiceHistory(client.id);
        }
    }, [client?.id, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const isViewMode = mode === 'view';

    const fetchServiceHistory = async (clientId) => {
        if (!clientId || !isViewMode) return;
        
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/clients/${clientId}/service-history`
            );
            setServiceHistory(response.data || []);
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            setError('Falha ao carregar o histórico de serviços');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const renderServiceStatus = (status) => {
        const statusConfig = {
            pending: { color: 'warning', label: 'Pendente' },
            in_progress: { color: 'info', label: 'Em Andamento' },
            completed: { color: 'success', label: 'Concluído' },
            canceled: { color: 'error', label: 'Cancelado' }
        };

        const config = statusConfig[status] || { color: 'default', label: status };
        return <Chip size="small" color={config.color} label={config.label} />;
    };

    const renderTaskPriority = (priority) => {
        const priorityConfig = {
            low: { color: 'success', label: 'Baixa' },
            medium: { color: 'warning', label: 'Média' },
            high: { color: 'error', label: 'Alta' }
        };

        const config = priorityConfig[priority] || { color: 'default', label: priority };
        return <Chip size="small" variant="outlined" color={config.color} label={config.label} />;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            keepMounted={false}
            disableEscapeKeyDown={mode !== 'view'}
        >
            <DialogTitle>
                {mode === 'create' ? 'Novo Cliente' : 
                 mode === 'edit' ? 'Editar Cliente' : 'Detalhes do Cliente'}
            </DialogTitle>
            
            {isViewMode ? (
                <>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Dados do Cliente" />
                        <Tab label="Histórico de Serviços" />
                    </Tabs>

                    <DialogContent>
                        {tabValue === 0 ? (
                            // Conteúdo existente do formulário
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Nome"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Telefone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Documento"
                                        name="document"
                                        value={formData.document}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ mt: 2, mb: 1 }}>Endereço</Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="CEP"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Rua"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Número"
                                        name="address.number"
                                        value={formData.address.number}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Complemento"
                                        name="address.complement"
                                        value={formData.address.complement}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Bairro"
                                        name="address.district"
                                        value={formData.address.district}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Cidade"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Estado"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        disabled={isViewMode}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            // Tab de histórico
                            <Box>
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : error ? (
                                    <Typography color="error">{error}</Typography>
                                ) : serviceHistory.orders?.length === 0 ? (
                                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                                        Nenhum serviço encontrado para este cliente.
                                    </Typography>
                                ) : (
                                    <>
                                        {/* Resumo estatístico */}
                                        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant="subtitle2">Total de Ordens</Typography>
                                                    <Typography variant="h6">
                                                        {serviceHistory.stats.totalOrders}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant="subtitle2">Valor Total</Typography>
                                                    <Typography variant="h6">
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(serviceHistory.stats.totalValue)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant="subtitle2">Status</Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        {Object.entries(serviceHistory.stats.ordersByStatus).map(([status, count]) => (
                                                            <Chip
                                                                key={status}
                                                                size="small"
                                                                label={`${status}: ${count}`}
                                                                {...renderServiceStatus(status)}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Lista de ordens de serviço */}
                                        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                                            <Table stickyHeader size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Data</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Tarefas</TableCell>
                                                        <TableCell align="right">Valor</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {serviceHistory.orders.map((order) => (
                                                        <TableRow key={order.id}>
                                                            <TableCell>
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                {renderServiceStatus(order.status)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                    {order.tasks.map(task => (
                                                                        <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Typography variant="body2">
                                                                                {task.description}
                                                                            </Typography>
                                                                            {renderTaskPriority(task.priority)}
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {new Intl.NumberFormat('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL'
                                                                }).format(order.totalValue)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                </>
            ) : (

                // Modo de criação/edição - mantém o conteúdo original
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nome"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Telefone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Documento"
                                    name="document"
                                    value={formData.document}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ mt: 2, mb: 1 }}>Endereço</Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="CEP"
                                    name="address.zipCode"
                                    value={formData.address.zipCode}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Rua"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Número"
                                    name="address.number"
                                    value={formData.address.number}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Complemento"
                                    name="address.complement"
                                    value={formData.address.complement}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Bairro"
                                    name="address.district"
                                    value={formData.address.district}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Cidade"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Estado"
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    disabled={isViewMode}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="contained" color="primary">
                            Salvar
                        </Button>
                    </DialogActions>
                </form>
            )}

            {isViewMode && (
                <DialogActions>
                    <Button onClick={onClose}>Fechar</Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default ClientDialog;