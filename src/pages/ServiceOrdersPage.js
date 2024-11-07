import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, Chip, Button, IconButton, Grid, Card, CardContent,
    Skeleton, useMediaQuery, useTheme, TextField, InputAdornment, Toolbar, TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../config/axios';
import ServiceOrderDialog from '../components/ServiceOrderDialog';
import ConfirmDialog from '../components/ConfirmDialog';

const ServiceOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pending: 0,
        completed: 0,
        expectedRevenue: 0,
        actualRevenue: 0
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [filters, setFilters] = useState({
        status: '',
        startDate: null,
        endDate: null
    });
    const [availableServices, setAvailableServices] = useState([]);

    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const initialOrderState = {
        clientId: '',
        serviceId: '',
        serviceType: '',
        serviceAttributes: {},
        expectedCompletionDate: null,
        orderSource: '',
        description: '',
        deliveryType: 'pickup', // ou 'delivery'
        deliveryAddress: '',
        paymentMethod: '',
        artObservations: '',
        artApprovalStatus: 'pending',
        serviceValue: 0,
        discount: 0,
        internalNotes: '',
        status: 'pending',
        cep: '',
        deliveryNumber: ''
    };

    const fetchServiceOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/service-orders', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: searchTerm,
                    status: filters.status,
                    startDate: filters.startDate,
                    endDate: filters.endDate
                }
            });
            
            setOrders(response.data.orders);
            setStats({
                totalOrders: response.data.total,
                pending: response.data.stats.pending,
                completed: response.data.stats.completed,
                expectedRevenue: response.data.stats.expectedRevenue,
                actualRevenue: response.data.stats.actualRevenue
            });
            
        } catch (error) {
            console.error('Erro ao buscar ordens:', error);
            setError('Falha ao carregar as ordens de serviço');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceOrders();
    }, [page, rowsPerPage, searchTerm, filters]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/api/services');
                setAvailableServices(response.data);
            } catch (error) {
                console.error('Erro ao buscar serviços:', error);
            }
        };
        
        fetchServices();
    }, []);

    const handleOpenDialog = (mode, order = null) => {
        setDialogMode(mode);
        setSelectedOrder(order);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrder(null);
        setDialogMode('create');
    };

    const handleDeleteClick = (order) => {
        setSelectedOrder(order);
        setOpenConfirmDialog(true);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/service-orders/${selectedOrder.id}`);
            fetchServiceOrders();
            setOpenConfirmDialog(false);
            setSelectedOrder(null);
        } catch (error) {
            console.error('Erro ao excluir ordem:', error);
            setError('Falha ao excluir a ordem de serviço');
        }
    };

    const handleSaveOrder = async (orderData) => {
        try {
            if (dialogMode === 'edit') {
                await api.put(`/api/service-orders/${selectedOrder.id}`, orderData);
            } else {
                await api.post('/api/service-orders', orderData);
            }
            fetchServiceOrders();
            handleCloseDialog();
        } catch (error) {
            console.error('Erro ao salvar ordem:', error);
            setError('Falha ao salvar a ordem de serviço');
        }
    };

    const renderServiceOrderStatus = (status) => {
        const statusConfig = {
            pending: { color: 'warning', label: 'Pendente' },
            in_progress: { color: 'info', label: 'Em Andamento' },
            completed: { color: 'success', label: 'Concluído' },
            cancelled: { color: 'error', label: 'Cancelado' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    const handleCreateOrder = (serviceId) => {
        const selectedService = availableServices.find(s => s.id === serviceId);
        if (!selectedService) return;

        setSelectedOrder({
            ...initialOrderState,
            serviceId: selectedService.id,
            serviceType: selectedService.service_type_id,
            serviceAttributes: selectedService.attributes
        });
        setDialogMode('create');
        setOpenDialog(true);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                    {[1, 2, 3].map((item) => (
                        <Grid item xs={12} sm={4} key={item}>
                            <Skeleton variant="rectangular" height={100} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom align="center">
                Gestão de Ordens de Serviço
            </Typography>

            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar ordens..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: isMobile ? '100%' : '300px' }}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('create')}
                >
                    Nova Ordem
                </Button>
            </Toolbar>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Typography variant="h6">Total de Ordens</Typography>
                            <Typography variant="h4">{stats.totalOrders}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Typography variant="h6">Receita Esperada</Typography>
                            <Typography variant="h4">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(stats.expectedRevenue)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Typography variant="h6">Receita em Caixa</Typography>
                            <Typography variant="h4">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(stats.actualRevenue)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: '#f3e5f5' }}>
                        <CardContent>
                            <Typography variant="h6">Ordens Pendentes</Typography>
                            <Typography variant="h4">{stats.pending}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nº OS</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Valor Total</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.order_number}</TableCell>
                                <TableCell>
                                    {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                                </TableCell>
                                <TableCell>{order.client?.name}</TableCell>
                                <TableCell>{renderServiceOrderStatus(order.status)}</TableCell>
                                <TableCell>
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(order.total_value)}
                                </TableCell>
                                <TableCell>
                                    <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleOpenDialog('edit', order)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeleteClick(order)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={stats.totalOrders}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                }}
                labelRowsPerPage="Itens por página"
                labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            />

            <ServiceOrderDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSaveOrder}
                order={selectedOrder}
                mode={dialogMode}
                availableServices={availableServices}
            />

            <ConfirmDialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                onConfirm={handleDelete}
                title="Confirmar exclusão"
                content="Tem certeza que deseja excluir esta ordem de serviço?"
            />
        </Box>
    );
};

export default ServiceOrdersPage;